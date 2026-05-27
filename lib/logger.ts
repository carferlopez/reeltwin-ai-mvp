interface LogData {
  order_reference?: string;
  [key: string]: any;
}

export function log(event: string, data: LogData = {}) {
  // Safe deep copy
  let clonedData: any = {};
  try {
    clonedData = JSON.parse(JSON.stringify(data));
  } catch (err) {
    clonedData = { raw_data_error: "Serialization failed", ...data };
  }

  // Gracefully handle error stack truncation (limit to 500 chars)
  if (clonedData.error) {
    if (typeof clonedData.error === "object") {
      if (clonedData.error.stack) {
        clonedData.error.stack = String(clonedData.error.stack).substring(0, 500) + "... [truncated]";
      }
      if (clonedData.error.message) {
        clonedData.error.message = String(clonedData.error.message).substring(0, 500);
      }
    } else if (typeof clonedData.error === "string") {
      clonedData.error = clonedData.error.substring(0, 500);
    }
  }

  const payload = {
    ts: new Date().toISOString(),
    event,
    ...clonedData
  };

  // Structured stdout logging
  console.log(JSON.stringify(payload));
}
