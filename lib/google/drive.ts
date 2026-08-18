import { getDriveAuthClient } from "@/lib/google/driveAuth";

const DRIVE_API = "https://www.googleapis.com/drive/v3";
const DRIVE_UPLOAD_API = "https://www.googleapis.com/upload/drive/v3";

function escapeQueryValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

async function driveRequest<T>(
  url: string,
  options?: { method?: "GET" | "POST" | "DELETE"; headers?: Record<string, string>; data?: Buffer },
): Promise<T> {
  const client = getDriveAuthClient();
  const res = await client.request<T>({
    url,
    method: options?.method ?? "GET",
    headers: options?.headers,
    data: options?.data,
  });
  return res.data;
}

/** Finds a folder by exact name directly under `parentFolderId`, or null if none exists. */
export async function findFolderIdByName(
  parentFolderId: string,
  name: string,
): Promise<string | null> {
  const query = [
    `'${parentFolderId}' in parents`,
    `name = '${escapeQueryValue(name)}'`,
    "mimeType = 'application/vnd.google-apps.folder'",
    "trashed = false",
  ].join(" and ");

  const params = new URLSearchParams({
    q: query,
    fields: "files(id, name)",
    supportsAllDrives: "true",
    includeItemsFromAllDrives: "true",
    corpora: "allDrives",
  });

  const data = await driveRequest<{ files: { id: string; name: string }[] }>(
    `${DRIVE_API}/files?${params.toString()}`,
  );
  return data.files[0]?.id ?? null;
}

/** Finds a file by exact name directly under `parentFolderId`, or null if none exists. */
async function findFileIdByName(parentFolderId: string, name: string): Promise<string | null> {
  const query = [
    `'${parentFolderId}' in parents`,
    `name = '${escapeQueryValue(name)}'`,
    "trashed = false",
  ].join(" and ");

  const params = new URLSearchParams({
    q: query,
    fields: "files(id, name)",
    supportsAllDrives: "true",
    includeItemsFromAllDrives: "true",
    corpora: "allDrives",
  });

  const data = await driveRequest<{ files: { id: string; name: string }[] }>(
    `${DRIVE_API}/files?${params.toString()}`,
  );
  return data.files[0]?.id ?? null;
}

async function deleteFile(fileId: string): Promise<void> {
  await driveRequest(`${DRIVE_API}/files/${fileId}?supportsAllDrives=true`, { method: "DELETE" });
}

/**
 * Uploads `buffer` as `filename` into `parentFolderId`. If a file with the same name already
 * exists there (e.g. a re-run for the same week after a correction), it is replaced.
 */
export async function uploadFileToFolder(
  parentFolderId: string,
  filename: string,
  buffer: Buffer,
  mimeType: string,
): Promise<string> {
  const existingFileId = await findFileIdByName(parentFolderId, filename);
  if (existingFileId) {
    await deleteFile(existingFileId);
  }

  const boundary = `jbjtimesheet${Date.now()}`;
  const metadata = JSON.stringify({ name: filename, parents: [parentFolderId] });

  const multipartBody = Buffer.concat([
    Buffer.from(
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n` +
        `--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`,
    ),
    buffer,
    Buffer.from(`\r\n--${boundary}--`),
  ]);

  const params = new URLSearchParams({ uploadType: "multipart", supportsAllDrives: "true" });
  const data = await driveRequest<{ id: string }>(`${DRIVE_UPLOAD_API}/files?${params.toString()}`, {
    method: "POST",
    headers: { "Content-Type": `multipart/related; boundary=${boundary}` },
    data: multipartBody,
  });
  return data.id;
}
