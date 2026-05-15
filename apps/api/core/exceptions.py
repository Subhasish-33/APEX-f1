from fastapi import Request
from fastapi.responses import JSONResponse
from schemas.envelope import ErrorEnvelope, ErrorDetail, MetaSchema

class ApexException(Exception):
    def __init__(self, code: str, message: str, status_code: int = 400, context: dict = None):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.context = context

class ResourceNotFoundException(ApexException):
    def __init__(self, message: str, context: dict = None):
        super().__init__(code="RESOURCE_NOT_FOUND", message=message, status_code=404, context=context)

class ServiceDegradedException(ApexException):
    def __init__(self, message: str, context: dict = None):
        super().__init__(code="SERVICE_DEGRADED", message=message, status_code=503, context=context)

async def apex_exception_handler(request: Request, exc: ApexException):
    envelope = ErrorEnvelope(
        error=ErrorDetail(
            code=exc.code,
            message=exc.message,
            status=exc.status_code,
            context=exc.context
        )
    )
    return JSONResponse(status_code=exc.status_code, content=envelope.dict())

async def global_exception_handler(request: Request, exc: Exception):
    envelope = ErrorEnvelope(
        error=ErrorDetail(
            code="INTERNAL_SERVER_ERROR",
            message="An unexpected error occurred.",
            status=500
        )
    )
    return JSONResponse(status_code=500, content=envelope.dict())
