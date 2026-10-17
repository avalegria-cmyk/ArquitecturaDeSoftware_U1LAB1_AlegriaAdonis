class ApplicationError(Exception):
    def __init__(self, message, code="validation_error", status=422, fields=None):
        super().__init__(message)
        self.code = code
        self.status = status
        self.fields = fields or {}
