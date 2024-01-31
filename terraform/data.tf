data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_ecr_repository" "frontend" {
  name = "wipi-frontend"
}