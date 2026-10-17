<?php
declare(strict_types=1);
namespace Weather\Domain;

interface ProcessingGateway
{
    public function state(): array;
    public function train(string $path, string $filename): array;
    public function predict(array $features, string $modelId): array;
}
