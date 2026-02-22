# ---
# Terraform Configuration: ERM Platform Foundation
# Provider: Oracle Cloud Infrastructure (OCI) - "Always Free" 24GB ARM Plan
# ---

terraform {
  required_providers {
    oci = {
      source  = "oracle/oci"
      version = ">= 4.0.0"
    }
  }
}

provider "oci" {
  tenancy_ocid     = var.tenancy_ocid
  user_ocid        = var.user_ocid
  fingerprint      = var.fingerprint
  private_key_path = var.private_key_path
  region           = var.region
}

# 1. Networking (Virtual Cloud Network)
resource "oci_core_vcn" "erm_vcn" {
  compartment_id = var.compartment_ocid
  cidr_block     = "10.0.0.0/16"
  display_name   = "erm-platform-network"
  dns_label      = "ermvcn"
}

resource "oci_core_internet_gateway" "erm_ig" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.erm_vcn.id
  display_name   = "erm-gateway"
}

resource "oci_core_route_table" "erm_rt" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.erm_vcn.id
  display_name   = "erm-route-table"

  route_rules {
    destination       = "0.0.0.0/0"
    destination_type  = "CIDR_BLOCK"
    network_entity_id = oci_core_internet_gateway.erm_ig.id
  }
}

resource "oci_core_subnet" "erm_subnet" {
  compartment_id    = var.compartment_ocid
  vcn_id            = oci_core_vcn.erm_vcn.id
  cidr_block        = "10.0.1.0/24"
  display_name      = "erm-public-subnet"
  dns_label         = "ermsub"
  route_table_id    = oci_core_route_table.erm_rt.id
  security_list_ids = [oci_core_security_list.erm_sl.id]
}

# 2. Security (Security List / Firewall)
resource "oci_core_security_list" "erm_sl" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.erm_vcn.id
  display_name   = "erm-security-list"

  # Egress: Allow all
  egress_security_rules {
    destination = "0.0.0.0/0"
    protocol    = "all"
  }

  # Ingress: SSH
  ingress_security_rules {
    protocol = "6" # TCP
    source   = "0.0.0.0/0"
    tcp_options {
      min = 22
      max = 22
    }
  }

  # Ingress: HTTP
  ingress_security_rules {
    protocol = "6"
    source   = "0.0.0.0/0"
    tcp_options {
      min = 80
      max = 80
    }
  }

  # Ingress: HTTPS
  ingress_security_rules {
    protocol = "6"
    source   = "0.0.0.0/0"
    tcp_options {
      min = 443
      max = 443
    }
  }

  # Ingress: Grafana Dashboards
  ingress_security_rules {
    protocol = "6"
    source   = "0.0.0.0/0"
    tcp_options {
      min = 3000
      max = 3000
    }
  }

  # Ingress: Web Portal
  ingress_security_rules {
    protocol = "6"
    source   = "0.0.0.0/0"
    tcp_options {
      min = 5180
      max = 5180
    }
  }

  # Ingress: Keycloak IAM
  ingress_security_rules {
    protocol = "6"
    source   = "0.0.0.0/0"
    tcp_options {
      min = 8080
      max = 8080
    }
  }

  # Ingress: Jaeger UI
  ingress_security_rules {
    protocol = "6"
    source   = "0.0.0.0/0"
    tcp_options {
      min = 16686
      max = 16686
    }
  }

  # Ingress: Mailpit UI
  ingress_security_rules {
    protocol = "6"
    source   = "0.0.0.0/0"
    tcp_options {
      min = 8025
      max = 8025
    }
  }
}

# 3. Compute (The "Always Free" ARM Instance)
resource "oci_core_instance" "erm_server" {
  availability_domain = data.oci_identity_availability_domain.ad.name
  compartment_id      = var.compartment_ocid
  display_name        = "erm-production-01"
  
  # ARM Ampere shape (Always Free eligible)
  shape = "VM.Standard.A1.Flex"
  
  shape_config {
    memory_in_gbs = 24
    ocpus         = 4
  }

  source_details {
    source_type = "image"
    source_id   = var.image_ocid # Usually Ubuntu 22.04 ARM
  }

  create_vnic_details {
    subnet_id        = oci_core_subnet.erm_subnet.id
    display_name     = "erm-vnic"
    assign_public_ip = true
    hostname_label   = "erm-host"
  }

  metadata = {
    ssh_authorized_keys = var.ssh_public_key
    user_data           = base64encode(file("${path.module}/scripts/setup-docker.sh"))
  }
}

data "oci_identity_availability_domain" "ad" {
  compartment_id = var.tenancy_ocid
  ad_number      = 1
}
