import { NextRequest, NextResponse } from "next/server";
import { IncomingForm } from "formidable";
import { promises as fs } from "fs";
import cloudinary from "@/lib/cloundinary";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  try {
    const data = await new Promise<{ fields: any; files: any }>(
      (resolve, reject) => {
        const form = new IncomingForm({ keepExtensions: true });

        form.parse(req as any, (err, fields, files) => {
          if (err) reject(err);
          else resolve({ fields, files });
        });
      }
    );

    const uploadedFile = Array.isArray(data.files.file)
      ? data.files.file[0]
      : data.files.file;

    if (!uploadedFile) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const fileBuffer = await fs.readFile(uploadedFile.filepath);

    const result = await new Promise<{ secure_url: string }>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "school-images" },
          (error, result) => {
            if (error || !result) {
              reject(new Error("Cloudinary upload failed"));
            } else {
              resolve(result);
            }
          }
        );
        uploadStream.end(fileBuffer);
      }
    );

    return NextResponse.json({ url: result.secure_url }, { status: 200 });
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json({ error: "File upload failed" }, { status: 500 });
  }
}
