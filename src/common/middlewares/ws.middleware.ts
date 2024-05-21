import { Socket } from 'socket.io';
import { WsGuard } from '../guards/ws.guard';

/**
 * Socket authentication middleware
 *
 * This middleware is responsible for authenticating socket connections
 *
 * @param client - The socket client
 * @returns An array containing the room and user ID if authentication is successful, otherwise it disconnects the client
 */
export const SocketAuthMiddelware = (client: Socket) => {
  try {
    /**
     * Extract the authorization header from the socket handshake
     *
     * The authorization header is expected to be in the format "Bearer <token>"
     */
    const [bearer, token] = client.handshake.headers.authorization.split(' ');
    /**
     * Extract the room from the socket handshake headers
     */
    const room = client.handshake.headers.room;

    /**
     * If the token or room is missing, disconnect the client
     */
    if (!token || !room) client.disconnect();

    /**
     * Validate the token using the WsGuard
     *
     * The WsGuard is responsible for verifying the token and extracting the user ID
     */
    const { id } = WsGuard.validate(token);
    /**
     * Return an array containing the room and user ID
     */
    return [room, id];
  } catch (error) {
    /**
     * If an error occurs during authentication, disconnect the client
     */
    client.disconnect();
  }
};
