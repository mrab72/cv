#!/bin/bash

# Deployment script for CV and Tech Notes applications
# Usage: ./deploy.sh [build|start|stop|restart|logs|status]

set -e

COMMAND=${1:-start}

case $COMMAND in
  build)
    echo "Building Docker images..."
    docker-compose build --no-cache
    ;;

  start)
    echo "Starting services..."
    docker-compose up -d
    echo ""
    echo "Services started!"
    echo "Check status with: docker-compose ps"
    echo "View logs with: docker-compose logs -f"
    ;;

  stop)
    echo "Stopping services..."
    docker-compose down
    echo "Services stopped."
    ;;

  restart)
    echo "Restarting services..."
    docker-compose restart
    echo "Services restarted."
    ;;

  logs)
    docker-compose logs -f
    ;;

  status)
    echo "Service Status:"
    docker-compose ps
    echo ""
    echo "Resource Usage:"
    docker stats --no-stream
    ;;

  update)
    echo "Updating applications..."
    git pull
    docker-compose up -d --build
    echo "Update complete!"
    ;;

  check)
    echo "Checking nginx configuration..."
    docker-compose exec nginx nginx -t
    ;;

  *)
    echo "Usage: $0 {build|start|stop|restart|logs|status|update|check}"
    echo ""
    echo "Commands:"
    echo "  build   - Build Docker images from scratch"
    echo "  start   - Start all services"
    echo "  stop    - Stop all services"
    echo "  restart - Restart all services"
    echo "  logs    - View logs (follow mode)"
    echo "  status  - Show service status and resource usage"
    echo "  update  - Pull latest code and rebuild"
    echo "  check   - Check nginx configuration"
    exit 1
    ;;
esac
