terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.24.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
  shared_credentials_files = ["/modules/creds/awsterraformtest_accessKeys"]
}

resource "random_pet" "name_randomness" {
  length = 1
}

module "main_vpc" {
  source = "/modules/vpc"
  vpc_cidr_block = "10.10.0.0/16"
  name_of_vpc = "vpc-${random_pet.name_randomness.id}"
}

resource "aws_internet_gateway" "main_igw" {
  vpc_id = module.main_vpc.id
  tags = {
    Name = "main_igw-${random_pet.name_randomness.id}"
  }
}

resource "aws_route_table" "main_route_table" {
  vpc_id = module.main_vpc.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main_igw.id
  }
  tags = {
    Name = "main_route_table-${random_pet.name_randomness.id}"
  }
}

data "aws_availability_zones" "available" {
  state = "available"
}

module "subnets" {
  source = "/modules/subnet"
  subnets = [
    { cidr_block = "10.10.0.0/24", availability_zone = data.aws_availability_zones.available.names[0], zone_letter = "a" },
    { cidr_block = "10.10.1.0/24", availability_zone = data.aws_availability_zones.available.names[1], zone_letter = "b" },
    { cidr_block = "10.10.2.0/24", availability_zone = data.aws_availability_zones.available.names[2], zone_letter = "c" },
  ]
  vpc_id = module.main_vpc.id
  name = "subnet-${random_pet.name_randomness.id}-"
  route_table_id = aws_route_table.main_route_table.id
}

resource "aws_security_group" "frontend_sg" {
  name = "frontend_sg-${random_pet.name_randomness.id}"
  vpc_id = module.main_vpc.id

  ingress {
    from_port = 80
    to_port = 80
    protocol = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port = 0
    to_port = 0
    protocol = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "backend_sg" {
  name = "backend_sg-${random_pet.name_randomness.id}"
  vpc_id = module.main_vpc.id

  ingress {
    from_port = 80
    to_port = 80
    protocol = "tcp"
    security_groups = [aws_security_group.frontend_sg.id]
  }

  egress {
    from_port = 0
    to_port = 0
    protocol = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "db_sg" {
  name = "db_sg-${random_pet.name_randomness.id}"
  vpc_id = module.main_vpc.id

  ingress {
    from_port = 5432
    to_port = 5432
    protocol = "tcp"
    security_groups = [aws_security_group.backend_sg.id]
  }

  egress {
    from_port = 0
    to_port = 0
    protocol = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_db_instance" "main_db" {
  allocated_storage    = 20
  storage_type         = "gp2"
  engine               = "postgres"
  engine_version       = "12.4"
  instance_class       = "db.t3.micro"
  name                 = "mydb"
  username             = "user"
  password             = "password"
  parameter_group_name = "default.postgres12"
  skip_final_snapshot  = true
  vpc_security_group_ids = [aws_security_group.db_sg.id]
  db_subnet_group_name = aws_db_subnet_group.main_db_subnet_group.id
}

resource "aws_db_subnet_group" "main_db_subnet_group" {
  name       = "main-db-subnet-group"
  subnet_ids = [module.subnets.ids[2]]
}

# EC2 Instances for Frontend and Backend

# Frontend EC2 instance
resource "aws_instance" "frontend_instance" {
  ami           = "ami-0abcdef1234567890"  # Replace with your AMI ID
  instance_type = "t2.micro"
  subnet_id     = module.subnets.ids[0]
  vpc_security_group_ids = [aws_security_group.frontend_sg.id]

  tags = {
    Name = "Frontend-${random_pet.name_randomness.id}"
  }
}

# Backend EC2 instance
resource "aws_instance" "backend_instance" {
  ami           = "ami-0abcdef1234567890"  # Replace with your AMI ID
  instance_type = "t2.micro"
  subnet_id     = module.subnets.ids[1]
  vpc_security_group_ids = [aws_security_group.backend_sg.id]

  tags = {
    Name = "Backend-${random_pet.name_randomness.id}"
  }
}

# Route53 record for the Frontend
data "aws_route53_zone" "selected" {
  name         = "test.com"
  private_zone = false
}


resource "aws_route53_record" "www_record" {
  zone_id = data.aws_route53_zone.selected.zone_id
  name    = "www.test.com"
  type    = "A"

  alias {
    name                   = aws_instance.frontend_instance.public_dns
    zone_id                = aws_instance.frontend_instance.availability_zone
    evaluate_target_health = true
  }
}
