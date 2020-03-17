$mode, $commands = $args
if ($mode -eq "prod") {
    docker exec concepts_concepts_1 prisma $commands
} elseif ($mode -eq "dev") {
    docker exec concepts_backend_1 prisma $commands
} else {
    docker exec concepts_backend_1 prisma $args
}
