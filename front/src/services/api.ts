import { Hand } from '../models/Hand';

export const saveHand = async (hand: Hand): Promise<Hand> => {
    const response = await fetch('http://localhost:8000/hands', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(hand),
    });

    if (!response.ok) {
        throw new Error('Failed to save hand');
    }

    return await response.json();
};

export const getHands = async (): Promise<Hand[]> => {
    const response = await fetch('http://localhost:8000/hands');
    if (!response.ok) {
        throw new Error('Failed to fetch hands');
    }
    return await response.json();
}; 