import { selectFirmHandler } from "five-star-conveyancing-quote-engine/api/selectFirm";
import { db } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ reference: string }> }
): Promise<Response> {
  const { reference } = await params;
  return selectFirmHandler(reference, request, db);
}
