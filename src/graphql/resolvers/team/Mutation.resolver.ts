import { nanoid } from "nanoid";
import {
  FAILED_TO_DELETE_TEAM,
  FAILED_TO_JOIN_TEAM,
  FAILED_TO_MAKE_ADMIN,
  FAILED_TO_PIN_TEAM,
  FAILED_TO_REMOVE_ADMIN,
  FAILED_TO_REMOVE_MEMBER,
  FAILED_TO_UNPIN_TEAM,
  FAILED_TO_UPDATE_TEAM,
  INVALID_INVITE_CODE,
  NOT_A_TEAM_MEMBER,
} from "src/constants/responseCodes";
import type { AppContext, CreateTeamInput, UpdateTeamInput } from "src/types";
import QueryError from "src/utils/errors/QueryError";

export default {
  Mutation: {
    async createTeam(
      parent: unknown,
      { input }: { input: CreateTeamInput },
      context: AppContext
    ) {
      const { prismaClient, currentUser } = context;
      const { name } = input;
      return prismaClient.team.create({
        data: {
          name,
          inviteCode: nanoid(),
          owner: {
            connect: {
              id: currentUser?.id,
            },
          },
          teammates: {
            create: {
              member: {
                connect: {
                  id: currentUser?.id,
                },
              },
              role: "ADMIN",
            },
          },
        },
      });
    },
    async updateTeam(
      parent: unknown,
      { input }: { input: UpdateTeamInput },
      context: AppContext
    ) {
      const { prismaClient, currentUser, t } = context;
      const { id, name } = input;

      // check current user has permission
      const team = await prismaClient.team.findFirst({
        where: {
          id,
          OR: [
            {
              ownerId: currentUser!.id,
            },
            {
              teammates: {
                some: {
                  memberId: currentUser!.id,
                  role: "ADMIN",
                },
              },
            },
          ],
        },
      });

      if (!team) {
        throw new QueryError(t(FAILED_TO_UPDATE_TEAM));
      }

      return prismaClient.team.update({
        data: {
          name,
        },
        where: {
          id,
        },
      });
    },
    async deleteTeam(
      parent: unknown,
      { teamId }: { teamId: string },
      context: AppContext
    ) {
      const { prismaClient, currentUser, t } = context;

      // check current user has permission
      const team = await prismaClient.team.findFirst({
        where: {
          id: teamId,
          OR: [
            {
              ownerId: currentUser!.id,
            },
            {
              teammates: {
                some: {
                  memberId: currentUser!.id,
                  role: "ADMIN",
                },
              },
            },
          ],
        },
      });

      if (!team) {
        throw new QueryError(t(FAILED_TO_DELETE_TEAM));
      }

      return prismaClient.team.delete({
        where: {
          id: teamId,
        },
      });
    },
    async joinTeam(
      parent: unknown,
      { inviteCode }: { inviteCode: string },
      context: AppContext
    ) {
      const { prismaClient, currentUser, t } = context;

      const team = await prismaClient.team.findFirst({
        where: {
          inviteCode,
          teammates: {
            none: {
              member: {
                id: currentUser?.id,
              },
            },
          },
        },
      });

      if (!team) {
        throw new QueryError(t(INVALID_INVITE_CODE));
      }

      try {
        const joinedTeam = await prismaClient.team.update({
          where: {
            id: team.id,
          },
          data: {
            teammates: {
              create: {
                role: currentUser?.id === team.ownerId ? "ADMIN" : "TEAMMATE",
                member: {
                  connect: {
                    id: currentUser!.id,
                  },
                },
              },
            },
          },
        });

        return joinedTeam;
      } catch (e) {
        throw new QueryError(t(FAILED_TO_JOIN_TEAM));
      }
    },
    async leaveTeam(
      parent: unknown,
      { teamId }: { teamId: string },
      context: AppContext
    ) {
      const { prismaClient, currentUser, t } = context;

      const teamMember = await prismaClient.teamMember.findFirst({
        where: {
          member: {
            id: currentUser!.id,
          },
          team: {
            id: teamId,
          },
        },
      });

      if (!teamMember) {
        throw new QueryError(t(NOT_A_TEAM_MEMBER));
      }

      return prismaClient.team.update({
        where: {
          id: teamId,
        },
        data: {
          teammates: {
            delete: {
              id: teamMember.id,
            },
          },
        },
      });
    },
    async removeTeammate(
      parent: unknown,
      { memberId }: { memberId: string },
      context: AppContext
    ) {
      const { prismaClient, currentUser, t } = context;

      // check current user has permission
      const member = await prismaClient.teamMember.findFirst({
        where: {
          id: memberId,
          team: {
            OR: [
              {
                owner: {
                  id: currentUser?.id,
                },
              },
              {
                teammates: {
                  some: {
                    member: {
                      id: currentUser?.id,
                    },
                    role: "ADMIN",
                  },
                },
              },
            ],
          },
        },
      });

      if (!member) {
        throw new QueryError(t(FAILED_TO_REMOVE_MEMBER));
      }

      return prismaClient.teamMember.delete({
        where: {
          id: member.id,
        },
      });
    },
    async addTeamMemberToAdmin(
      parent: unknown,
      { memberId }: { memberId: string },
      context: AppContext
    ) {
      const { prismaClient, currentUser, t } = context;

      // check current user has permission
      const member = await prismaClient.teamMember.findFirst({
        where: {
          id: memberId,
          team: {
            OR: [
              {
                ownerId: currentUser!.id,
              },
              {
                teammates: {
                  some: {
                    memberId: currentUser!.id,
                    role: "ADMIN",
                  },
                },
              },
            ],
          },
        },
      });

      if (!member) {
        throw new QueryError(t(FAILED_TO_MAKE_ADMIN));
      }

      return prismaClient.teamMember.update({
        where: {
          id: member.id,
        },
        data: {
          role: "ADMIN",
        },
      });
    },
    async removeTeamMemberFromAdmin(
      parent: unknown,
      { memberId }: { memberId: string },
      context: AppContext
    ) {
      const { prismaClient, currentUser, t } = context;

      // check current user has permission
      const member = await prismaClient.teamMember.findFirst({
        where: {
          id: memberId,
          team: {
            owner: {
              id: {
                not: memberId,
              },
            },
            OR: [
              {
                ownerId: currentUser!.id,
              },
              {
                teammates: {
                  some: {
                    memberId: currentUser!.id,
                    role: "ADMIN",
                  },
                },
              },
            ],
          },
        },
      });

      if (!member) {
        throw new QueryError(t(FAILED_TO_REMOVE_ADMIN));
      }

      return prismaClient.teamMember.update({
        where: {
          id: member.id,
        },
        data: {
          role: "TEAMMATE",
        },
      });
    },
    async pinTeam(
      _parent: unknown,
      { id }: { id: string },
      context: AppContext
    ) {
      const { prismaClient, currentUser, t } = context;

      const team = await prismaClient.team.findFirst({
        where: {
          id,
          teammates: {
            some: {
              member: {
                id: currentUser?.id,
              },
            },
          },
        },
      });

      if (!team) {
        throw new QueryError(t(FAILED_TO_PIN_TEAM));
      }

      return prismaClient.team.update({
        where: {
          id: team.id,
        },
        data: {
          pinnedBy: {
            create: {
              member: {
                connect: {
                  id: currentUser?.id,
                },
              },
            },
          },
        },
      });
    },
    async unpinTeam(
      _parent: unknown,
      { id }: { id: string },
      context: AppContext
    ) {
      const { prismaClient, currentUser, t } = context;

      const pinned = await prismaClient.pinnedTeam.findFirst({
        where: {
          member: {
            id: currentUser?.id,
          },
          team: {
            id,
          },
        },
      });

      if (!pinned) {
        throw new QueryError(t(FAILED_TO_UNPIN_TEAM));
      }

      return prismaClient.team.update({
        where: {
          id,
        },
        data: {
          pinnedBy: {
            delete: {
              id: pinned.id,
            },
          },
        },
      });
    },
  },
};
