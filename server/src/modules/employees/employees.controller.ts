import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const getEmployees = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).user?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const employees = await prisma.user.findMany({
      where: { tenantId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(employees);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch employees', error: error.message });
  }
};

export const createEmployee = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).user?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { name, email, password, role } = req.body;

    // Check if email is already in use within the tenant
    const existingUser = await prisma.user.findUnique({
      where: {
        tenantId_email: { tenantId, email },
      },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists for this tenant' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const employee = await prisma.user.create({
      data: {
        tenantId,
        name,
        email,
        password: hashedPassword,
        role: role || 'STAFF',
        isActive: true,
        emailVerified: true, // Auto verify if admin created
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      }
    });

    res.status(201).json(employee);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to create employee', error: error.message });
  }
};

export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).user?.tenantId;
    const employeeId = req.params.id;

    if (!tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { name, role, isActive, password } = req.body;
    
    let updateData: any = { name, role, isActive };

    if (password) {
       updateData.password = await bcrypt.hash(password, 10);
    }

    const employee = await prisma.user.update({
      where: {
        id: employeeId,
        tenantId, // Ensure they can only update users in their tenant
      },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      }
    });

    res.json(employee);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update employee', error: error.message });
  }
};

export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).user?.tenantId;
    const employeeId = req.params.id;

    if (!tenantId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (employeeId === (req as any).user?.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    await prisma.user.delete({
      where: {
        id: employeeId,
        tenantId,
      },
    });

    res.json({ message: 'Employee deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete employee', error: error.message });
  }
};
