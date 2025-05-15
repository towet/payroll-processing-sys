import React from 'react';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { useEmployeeStore } from '../store/employeeStore';

interface PayslipGeneratorProps {
  employeeId: string;
}

const PayslipGenerator: React.FC<PayslipGeneratorProps> = ({ employeeId }) => {
  const { employees, generatePayslip } = useEmployeeStore();
  const employee = employees.find(e => e.id === employeeId);

  const generatePDF = () => {
    if (!employee) return;

    const currentDate = new Date();
    const month = format(currentDate, 'MMMM');
    const year = currentDate.getFullYear();

    const payslip = generatePayslip(employeeId, month, year);

    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('PayrollPro - Payslip', 105, 20, { align: 'center' });
    
    // Employee Details
    doc.setFontSize(12);
    doc.text(`Employee Name: ${employee.name}`, 20, 40);
    doc.text(`Department: ${employee.department}`, 20, 50);
    doc.text(`Position: ${employee.position}`, 20, 60);
    
    // Salary Details
    doc.text('Salary Breakdown:', 20, 80);
    doc.text(`Basic Salary: $${payslip.basicSalary.toFixed(2)}`, 30, 90);
    doc.text(`Allowances: $${payslip.allowances.toFixed(2)}`, 30, 100);
    doc.text(`Deductions: $${payslip.deductions.toFixed(2)}`, 30, 110);
    
    // Net Salary
    doc.setFontSize(14);
    doc.text(`Net Salary: $${payslip.netSalary.toFixed(2)}`, 20, 130);
    
    // Footer
    doc.setFontSize(10);
    doc.text(`Generated on: ${format(new Date(), 'PPP')}`, 20, 150);
    
    // Save PDF
    doc.save(`payslip-${employee.name}-${month}-${year}.pdf`);
  };

  return (
    <button
      onClick={generatePDF}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      Generate Payslip
    </button>
  );
};

export default PayslipGenerator;