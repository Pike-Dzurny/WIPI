variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "image_tag" {
  description = "Docker image tag"
  type        = string
}


variable "BACKEND_URL" {
  description = "The backend URL"
  type        = string
}

variable "DATABASE_URL" {
  description = "The database URL"
  type        = string
}

variable "POSTGRES_USER" {
  description = "The PostgreSQL username"
  type        = string
}

variable "POSTGRES_PASSWORD" {
  description = "The PostgreSQL password"
  type        = string
}

variable "POSTGRES_DB" {
  description = "The PostgreSQL database name"
  type        = string
}

variable "AWS_ACCESS_KEY_ID" {
  description = "The AWS access key ID"
  type        = string
}

variable "AWS_SECRET_ACCESS_KEY" {
  description = "The AWS secret access key"
  type        = string
}

variable "NEXTAUTH_SECRET" {
  description = "The NextAuth secret"
  type        = string
}

variable "NEXTAUTH_URL" {
  description = "The NextAuth URL"
  type        = string
}

variable "NEXT_PUBLIC_FRONTED_URL" {
  description = "The frontend URL exposed to the public"
  type        = string
}

variable "NEXT_PUBLIC_API_URL" {
  description = "The public API URL"
  type        = string
}

variable "SECRET_API_URL" {
  description = "The secret API URL"
  type        = string
}
