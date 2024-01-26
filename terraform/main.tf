provider "aws" {
  region = "us-east-1"
}

resource "random_pet" "name_randomness" {
  length = 1
}

resource "aws_vpc" "main_vpc" {
  cidr_block = "10.10.0.0/16"
  tags = {
    Name = "vpc-${random_pet.name_randomness.id}"
  }
}

resource "aws_internet_gateway" "main_igw" {
  vpc_id = aws_vpc.main_vpc.id
  tags = {
    Name = "main_igw-${random_pet.name_randomness.id}"
  }
}

resource "aws_route_table" "main_route_table" {
  vpc_id = aws_vpc.main_vpc.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main_igw.id
  }
  tags = {
    Name = "main_route_table-${random_pet.name_randomness.id}"
  }
}

# Creating three subnets
resource "aws_subnet" "subnet" {
  count                   = 3
  vpc_id                  = aws_vpc.main_vpc.id
  cidr_block              = "10.10.${count.index}.0/24"
  availability_zone       = element(data.aws_availability_zones.available.names, count.index)
  map_public_ip_on_launch = true

  tags = {
    Name = "subnet-${random_pet.name_randomness.id}-${count.index}"
  }
}

resource "aws_security_group" "frontend_sg" {
  name   = "frontend_sg-${random_pet.name_randomness.id}"
  vpc_id = aws_vpc.main_vpc.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "backend_sg" {
  name   = "backend_sg-${random_pet.name_randomness.id}"
  vpc_id = aws_vpc.main_vpc.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = [aws_security_group.frontend_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

data "aws_ecr_repository" "frontend" {
  name = "wipi-frontend"
}

# Frontend EC2 instance
resource "aws_instance" "frontend_instance" {
  ami                    = "ami-0abcdef1234567890" # Replace with AMI ID
  instance_type          = "t2.micro"
  subnet_id              = aws_subnet.subnet[0].id
  vpc_security_group_ids = [aws_security_group.frontend_sg.id]
  user_data = <<-EOF
              #!/bin/bash
              # Install AWS CLI
              curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
              unzip awscliv2.zip
              sudo ./aws/install

              # Install Docker
              sudo yum update -y
              sudo amazon-linux-extras install docker
              sudo service docker start
              sudo usermod -a -G docker ec2-user

              # Authenticate with ECR
              $(aws ecr get-login --no-include-email --region ${var.aws_region})

              # Pull the Docker image from ECR
              docker pull ${data.aws_ecr_repository.frontend.repository_url}:${var.image_tag}

              # Run the Docker container
              docker run -d -p 80:80 ${data.aws_ecr_repository.frontend.repository_url}:${var.image_tag}
              EOF

  tags = {
    Name = "Frontend-${random_pet.name_randomness.id}"
  }
}

# Backend EC2 instance
resource "aws_instance" "backend_instance" {
  ami                    = "ami-0abcdef1234567890" # Replace with AMI ID
  instance_type          = "t2.micro"
  subnet_id              = aws_subnet.subnet[1].id
  vpc_security_group_ids = [aws_security_group.backend_sg.id]

  tags = {
    Name = "Backend-${random_pet.name_randomness.id}"
  }
}

resource "aws_route53_record" "www_record" {
  zone_id = "your_zone_id" # Filler info for now
  name    = "www.yourdomain.com"
  type    = "A"
  ttl     = "300"
  records = [aws_instance.frontend_instance.public_ip]
}
