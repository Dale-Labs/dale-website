import { readInternalSignal } from "../../_lib/internal-signal/read-signal.js";

export async function onRequestGet({ env }) {
  try {
    const reading = await readInternalSignal(env);
    return Response.json(reading, {
      status: reading.ready ? 200 : 503,
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    return Response.json({
      error: "Internal Signal registry read failed.",
      detail: error.message,
    }, {
      status: 500,
      headers: { "Cache-Control": "private, no-store" },
    });
  }
}

