import { Server, Socket } from 'socket.io';

let io: Server;

export const initializeSocket = (socketIO: Server): void => {
  io = socketIO;

  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join-hotel', (hotelId: string) => {
      socket.join(`hotel-${hotelId}`);
      console.log(`Socket ${socket.id} joined hotel-${hotelId}`);
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
      console.log('Client disconnected:', socket.id);
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
