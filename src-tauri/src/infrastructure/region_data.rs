const NORTH_AMERICA: &str = "North America";
const EUROPE: &str = "Europe";
const ASIA_PACIFIC: &str = "Asia Pacific";
const SOUTH_AMERICA: &str = "South America";

pub struct RegionDef {
    pub code: &'static str,
    pub name: &'static str,
    pub area: &'static str,
}

pub const REGIONS: &[RegionDef] = &[
    RegionDef { code: "us-east-1", name: "US East (N. Virginia)", area: NORTH_AMERICA },
    RegionDef { code: "us-east-2", name: "US East (Ohio)", area: NORTH_AMERICA },
    RegionDef { code: "us-west-1", name: "US West (N. California)", area: NORTH_AMERICA },
    RegionDef { code: "us-west-2", name: "US West (Oregon)", area: NORTH_AMERICA },
    RegionDef { code: "ca-central-1", name: "Canada (Central)", area: NORTH_AMERICA },
    RegionDef { code: "eu-west-1", name: "Europe (Ireland)", area: EUROPE },
    RegionDef { code: "eu-west-2", name: "Europe (London)", area: EUROPE },
    RegionDef { code: "eu-central-1", name: "Europe (Frankfurt)", area: EUROPE },
    RegionDef { code: "ap-south-1", name: "Asia Pacific (Mumbai)", area: ASIA_PACIFIC },
    RegionDef { code: "ap-east-1", name: "Asia Pacific (Hong Kong)", area: ASIA_PACIFIC },
    RegionDef { code: "ap-northeast-1", name: "Asia Pacific (Tokyo)", area: ASIA_PACIFIC },
    RegionDef { code: "ap-northeast-2", name: "Asia Pacific (Seoul)", area: ASIA_PACIFIC },
    RegionDef { code: "ap-southeast-1", name: "Asia Pacific (Singapore)", area: ASIA_PACIFIC },
    RegionDef { code: "ap-southeast-2", name: "Asia Pacific (Sydney)", area: ASIA_PACIFIC },
    RegionDef { code: "sa-east-1", name: "South America (São Paulo)", area: SOUTH_AMERICA },
];

pub fn hostnames_for(region_code: &str) -> Vec<String> {
    let service_endpoint = if region_code == "ap-east-1" {
        format!("ec2.{region_code}.amazonaws.com")
    } else {
        format!("gamelift.{region_code}.amazonaws.com")
    };
    vec![service_endpoint, format!("gamelift-ping.{region_code}.api.aws")]
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn standard_region_uses_gamelift_pattern() {
        let hosts = hostnames_for("eu-west-1");
        assert_eq!(hosts, vec!["gamelift.eu-west-1.amazonaws.com", "gamelift-ping.eu-west-1.api.aws"]);
    }

    #[test]
    fn ap_east_1_uses_ec2_override() {
        let hosts = hostnames_for("ap-east-1");
        assert_eq!(hosts, vec!["ec2.ap-east-1.amazonaws.com", "gamelift-ping.ap-east-1.api.aws"]);
    }

    #[test]
    fn all_fifteen_regions_present() {
        assert_eq!(REGIONS.len(), 15);
    }
}
