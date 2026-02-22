variable "tenancy_ocid" { type = string }
variable "user_ocid" { type = string }
variable "fingerprint" { type = string }
variable "private_key_path" { type = string }
variable "region" { type = string }
variable "compartment_ocid" { type = string }

variable "ssh_public_key" {
  description = "Content of your public SSH key (~/.ssh/id_rsa.pub)"
  type        = string
}

variable "image_ocid" {
  description = "OCID for Ubuntu 22.04 ARM image (Region specific)"
  type        = string
}
