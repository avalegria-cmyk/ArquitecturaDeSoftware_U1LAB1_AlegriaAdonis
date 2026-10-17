<?php
declare(strict_types=1);
namespace Weather\Domain;

final class ApiException extends \RuntimeException
{
    public function __construct(
        string $message,
        public readonly int $status = 422,
        public readonly string $errorCode = 'validation_error',
        public readonly array $fields = [],
    ) {
        parent::__construct($message);
    }
}
