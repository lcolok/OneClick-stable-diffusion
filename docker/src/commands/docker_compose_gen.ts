import { dockerComposeGen } from '../modules/dockerComposeGenerator';

export async function gen(): Promise<void> {
    dockerComposeGen()
}