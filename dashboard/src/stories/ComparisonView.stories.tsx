import type { Meta, StoryObj } from '@storybook/react-vite';
import ComparisonView from '../views/ComparisonView';

// Mock Data
const mockMps = [
    { id: '1', name: 'Andrius Kubilius', party: 'Tėvynės sąjunga', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Andrius_Kubilius_2019.jpg/440px-Andrius_Kubilius_2019.jpg' },
    { id: '2', name: 'Vilija Blinkevičiūtė', party: 'Lietuvos socialdemokratų partija', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Vilija_Blinkeviciute_2023.jpg/440px-Vilija_Blinkeviciute_2023.jpg' },
    { id: '3', name: 'Viktorija Čmilytė-Nielsen', party: 'Liberalų sąjūdis', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Viktorija_Cmilyte-Nielsen_2023.jpg/440px-Viktorija_Cmilyte-Nielsen_2023.jpg' },
];

const mockComparison = {
    alignment_matrix: [[1, 0.85], [0.85, 1]],
    mps: [mockMps[0], mockMps[1]],
    divergent_votes: [
        {
            vote_id: '101',
            title: 'Dėl Biudžeto įstatymo patvirtinimo',
            date: '2024-01-15',
            votes: {
                '1': 'Už',
                '2': 'Prieš'
            }
        },
        {
            vote_id: '102',
            title: 'Dėl mokesčių reformos',
            date: '2024-02-20',
            votes: {
                '1': 'Susilaikė',
                '2': 'Už'
            }
        }
    ]
};

const meta = {
    title: 'Views/ComparisonView',
    component: ComparisonView,
    parameters: {
        layout: 'fullscreen',
        backgrounds: { default: 'dark' },
    },
    decorators: [
        (Story, context) => {
            const originalFetch = window.fetch;
            const behavior = context.args.behavior as 'success' | 'error' | 'loading';

            window.fetch = (url, options) => {
                const urlStr = url.toString();

                // MP List is always needed for the selectors
                if (urlStr.endsWith('/api/mps')) {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve(mockMps),
                    } as Response);
                }

                // Comparison Logic
                if (urlStr.includes('compare')) {
                    if (behavior === 'error') {
                        return Promise.reject(new Error('Network Error: Could not reach comparison service.'));
                    }
                    if (behavior === 'loading') {
                        return new Promise(() => { }); // Infinite pending
                    }
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve(mockComparison),
                    } as Response);
                }

                return originalFetch(url, options);
            };

            return (
                <div className="min-h-screen w-full bg-[#0a0a0c] p-8">
                    <Story />
                </div>
            );
        }
    ],
    argTypes: {
        initialSelected: {
            control: 'object',
            description: 'Prefilled MP IDs to trigger comparison',
        },
        behavior: {
            control: { type: 'select' },
            options: ['success', 'loading', 'error'],
            description: 'Simulates different API responses',
            table: {
                defaultValue: { summary: 'success' },
            },
        },
    },
} satisfies Meta<typeof ComparisonView & { behavior?: string }>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        behavior: 'success',
        initialSelected: [null, null],
    },
};

export const DataPopulated: Story = {
    args: {
        behavior: 'success',
        initialSelected: ['1', '2'],
    },
};

export const LoadingState: Story = {
    args: {
        behavior: 'loading',
        initialSelected: ['1', '2'],
    },
};

export const ErrorState: Story = {
    args: {
        behavior: 'error',
        initialSelected: ['1', '2'],
    },
};
