// HTTP 응답 헬퍼 — Lambda Function URL 응답 형식
// CORS 헤더는 Lambda Function URL 콘솔 설정에서 부착 (코드에서 붙이면 중복돼 브라우저 거부)

export function respond(status, body, extra = {}) {
  const isJSON = typeof body === "object";
  return {
    statusCode: status,
    headers: {
      "content-type": isJSON
        ? "application/json; charset=utf-8"
        : "text/plain; charset=utf-8",
      ...extra,
    },
    body: isJSON ? JSON.stringify(body) : body,
  };
}
