import type { Site, SiteMember, User } from "@prisma/client";

export function toSiteSummaryDto(site: Site) {
  return {
    id: site.id,
    name: site.name,
    code: site.code,
    city: site.city,
    state: site.state,
    country: site.country,
    status: site.status,
    createdAt: site.createdAt,
  };
}

type SiteWithMembers = Site & { members: (SiteMember & { user: User })[] };

export function toSiteDetailDto(site: SiteWithMembers) {
  return {
    id: site.id,
    name: site.name,
    code: site.code,
    description: site.description,
    addressLine1: site.addressLine1,
    addressLine2: site.addressLine2,
    city: site.city,
    state: site.state,
    country: site.country,
    postalCode: site.postalCode,
    latitude: site.latitude,
    longitude: site.longitude,
    status: site.status,
    members: site.members.map((member) => ({
      userId: member.userId,
      role: member.role,
      firstName: member.user.firstName,
      lastName: member.user.lastName,
      email: member.user.email,
    })),
    createdAt: site.createdAt,
    updatedAt: site.updatedAt,
  };
}
