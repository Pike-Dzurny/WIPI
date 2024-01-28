variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "AWS_ACCESS_KEY_ID" {
  description = "The AWS access key ID"
  type        = string
}

variable "AWS_SECRET_ACCESS_KEY" {
  description = "The AWS secret access key"
  type        = string
}

variable "NEXT_PUBLIC_FRONTEND_URL" {
  description = "The frontend URL exposed to the public"
  type        = string
}

variable "AWS_ROUTE53_ZONE_ID" {
  description = "The AWS Route53 zone ID"
  type        = string
}

variable "AMI_ID" {
  description = "The EC2 AMI ID"
  type        = string
}

