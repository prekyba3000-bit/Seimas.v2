import type { Meta, StoryObj } from '@storybook/react-vite';
import { MpProfileLayout } from '../views/MpProfileView';

const meta = {
    title: 'Views/MpProfile',
    component: MpProfileLayout,
    parameters: {
        layout: 'fullscreen',
        backgrounds: { default: 'dark' },
    },
} satisfies Meta<typeof MpProfileLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockMp = {
    id: '123',
    name: 'Andrius Kubilius',
    party: 'Tėvynės sąjunga',
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Andrius_Kubilius_2019.jpg/440px-Andrius_Kubilius_2019.jpg',
    active: true,
    vote_count: 1543,
    attendance: 98,
    loyalty: 100,
    term_start: '2020-11-14',
    seimas_id: '123'
};

const mockVotes = [
    { title: 'Tax Reform Amendment', date: '2024-01-20', choice: 'Už' },
    { title: 'Education Bill v2', date: '2024-01-18', choice: 'Prieš' },
    { title: 'National Budget 2024', date: '2024-01-15', choice: 'Susilaikė' },
    { title: 'Defense Strategy', date: '2024-01-10', choice: 'Nedalyvavo' },
];

export const Loading: Story = {
    args: {
        loading: true,
        mp: null,
        votes: [],
    },
};

export const ErrorState: Story = {
    args: {
        loading: false,
        mp: null,
        votes: [],
    },
};

export const FullProfile: Story = {
    args: {
        loading: false,
        mp: mockMp,
        votes: mockVotes,
    },
};

export const NoVotes: Story = {
    args: {
        loading: false,
        mp: mockMp,
        votes: [],
    },
};

export const InactiveMP: Story = {
    args: {
        loading: false,
        mp: { ...mockMp, active: false, name: 'Inactive Member' },
        votes: mockVotes,
    },
};
