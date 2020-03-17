$mode, $commands = $args
if ($mode -eq "prod") {
  docker-compose -f docker-compose.yml -f production.yml $commands
} elseif ($mode -eq "dev") {
  docker-compose --compatibility -f docker-compose.yml -f development.yml $commands
} else {
  docker-compose --compatibility -f docker-compose.yml -f development.yml $args
}