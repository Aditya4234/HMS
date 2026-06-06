import cron from 'node-cron';
import prisma from '../config/database';

export const startOverdueInvoiceCron = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('[OverdueInvoiceCron] Running daily overdue invoice check...');
    try {
      const overdueInvoices = await prisma.invoice.findMany({
        where: {
          status: 'PENDING',
          dueDate: { lt: new Date() },
        },
        include: {
          booking: { select: { userId: true } },
        },
      });

      if (overdueInvoices.length === 0) {
        console.log('[OverdueInvoiceCron] No overdue invoices found.');
        return;
      }

      const invoiceIds = overdueInvoices.map((inv) => inv.id);
      await prisma.invoice.updateMany({
        where: { id: { in: invoiceIds } },
        data: { status: 'OVERDUE' },
      });

      for (const invoice of overdueInvoices) {
        await prisma.notification.create({
          data: {
            userId: invoice.booking.userId,
            title: 'Invoice Overdue',
            message: `Invoice ${invoice.invoiceNumber} is now overdue. Please pay as soon as possible.`,
            type: 'PAYMENT',
            link: '/dashboard/invoices',
          },
        }).catch((err) => console.error('[OverdueInvoiceCron] Notification failed:', err));
      }

      console.log(`[OverdueInvoiceCron] Marked ${overdueInvoices.length} invoices as OVERDUE.`);
    } catch (error) {
      console.error('[OverdueInvoiceCron] Error:', error);
    }
  });
};
