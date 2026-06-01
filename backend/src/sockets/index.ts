import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt';

let io: Server;

export const initializeSocket = (socketIO: Server): void => {
  io = socketIO;

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const decoded = verifyAccessToken(token);
      (socket as any).user = decoded;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;

    if (user?.userId) {
      socket.join(`user-${user.userId}`);
    }
    if (user?.hotelId) {
      socket.join(`hotel-${user.hotelId}`);
    }

    socket.on('join-hotel', (hotelId: string) => {
      socket.join(`hotel-${hotelId}`);
    });

    socket.on('leave-hotel', (hotelId: string) => {
      socket.leave(`hotel-${hotelId}`);
    });

    socket.on('booking-update', (data: any) => {
      socket.to(`hotel-${data.hotelId}`).emit('booking-updated', data);
    });

    socket.on('room-status-change', (data: any) => {
      socket.to(`hotel-${data.hotelId}`).emit('room-status-changed', data);
    });

    socket.on('notification', (data: any) => {
      socket.to(`user-${data.userId}`).emit('new-notification', data);
    });

    socket.on('disconnect', () => {
      socket.leave(`user-${user?.userId}`);
      if (user?.hotelId) socket.leave(`hotel-${user.hotelId}`);
    });
  });
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

export const emitToHotel = (hotelId: string, event: string, data: any): void => {
  if (io) {
    io.to(`hotel-${hotelId}`).emit(event, data);
  }
};

export const emitToUser = (userId: string, event: string, data: any): void => {
  if (io) {
    io.to(`user-${userId}`).emit(event, data);
  }
};
