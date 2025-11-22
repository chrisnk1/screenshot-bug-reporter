import axios from 'axios';
import { config } from '../config/env.js';
import type { LinearIssue } from '../types.js';
import type { TicketData } from '../utils/ticket-formatter.js';

/**
 * Creates a Linear issue using the GraphQL API
 */
export async function createLinearIssue(ticketData: TicketData): Promise<LinearIssue> {
    console.log('🎫 Creating Linear ticket...');

    const query = `
    mutation CreateIssue($input: IssueCreateInput!) {
      issueCreate(input: $input) {
        success
        issue {
          id
          identifier
          title
          url
        }
      }
    }
  `;

    try {
        // First, get the team ID if not configured
        const teamId = config.linearTeamId || await getDefaultTeamId();

        const variables = {
            input: {
                teamId,
                title: ticketData.title,
                description: ticketData.description,
                priority: ticketData.priority,
                // Labels will be added separately if needed
            },
        };

        const response = await axios.post(
            'https://api.linear.app/graphql',
            { query, variables },
            {
                headers: {
                    'Authorization': config.linearApiKey,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (response.data.errors) {
            throw new Error(`Linear API error: ${JSON.stringify(response.data.errors)}`);
        }

        const result = response.data.data.issueCreate;
        if (!result.success) {
            throw new Error('Failed to create Linear issue');
        }

        console.log('✓ Linear ticket created successfully');
        console.log(`  ID: ${result.issue.identifier}`);
        console.log(`  URL: ${result.issue.url}`);

        return {
            id: result.issue.id,
            identifier: result.issue.identifier,
            title: result.issue.title,
            url: result.issue.url,
        };
    } catch (error) {
        console.error('Error creating Linear issue:', error);
        throw new Error(`Linear ticket creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

async function getDefaultTeamId(): Promise<string> {
    const query = `
    query {
      teams {
        nodes {
          id
          name
        }
      }
    }
  `;

    try {
        const response = await axios.post(
            'https://api.linear.app/graphql',
            { query },
            {
                headers: {
                    'Authorization': config.linearApiKey,
                    'Content-Type': 'application/json',
                },
            }
        );

        const teams = response.data.data.teams.nodes;
        if (teams.length === 0) {
            throw new Error('No teams found in Linear workspace');
        }

        // Use the first team
        const teamId = teams[0].id;
        console.log(`Using team: ${teams[0].name} (${teamId})`);
        return teamId;
    } catch (error) {
        throw new Error(`Failed to get Linear team: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
