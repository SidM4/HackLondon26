'use client'

import { useRef, useCallback } from 'react'
import { useAnalysisStore } from '@/store/analysisStore'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

export function ReportDownload() {
  const reportRef = useRef<HTMLDivElement>(null)
  const inputs = useAnalysisStore((s) => s.inputs)
  const analyseResult = useAnalysisStore((s) => s.analyseResult)

  const handleDownload = useCallback(async () => {
    if (!reportRef.current || !analyseResult) return
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 20
    let y = margin

    // Header
    pdf.setFontSize(20)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Renovation Optimiser Report', margin, y)
    y += 10

    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Postcode: ${inputs?.postcode ?? '—'}`, margin, y)
    y += 6
    if (inputs?.property_description.property_type) {
      pdf.text(
        `Property: ${inputs.property_description.property_type}, ${inputs.property_description.bedrooms} bed, ${inputs.property_description.bathrooms} bath`,
        margin,
        y
      )
      y += 6
    }
    y += 5

    // Approval probability
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Council Approval Probability', margin, y)
    y += 8
    pdf.setFontSize(24)
    pdf.setFont('helvetica', 'bold')
    const approvalPct = Math.round(analyseResult.approval_probability * 100)
    pdf.text(`${approvalPct}%`, margin, y)
    y += 10

    // Precedents
    if (analyseResult.precedents?.length) {
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Previous Changes in Your Area', margin, y)
      y += 6
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      analyseResult.precedents.slice(0, 8).forEach((p) => {
        if (y > pageHeight - 30) {
          pdf.addPage()
          y = margin
        }
        pdf.text(`${p.app_id} — ${p.decision} — ${p.title}`, margin, y)
        y += 5
      })
      y += 5
    }

    // Suggested improvements
    if (analyseResult.suggested_improvements?.length) {
      if (y > pageHeight - 40) {
        pdf.addPage()
        y = margin
      }
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Suggested Home Improvements', margin, y)
      y += 8
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      analyseResult.suggested_improvements.forEach((imp) => {
        if (y > pageHeight - 30) {
          pdf.addPage()
          y = margin
        }
        pdf.setFont('helvetica', 'bold')
        pdf.text(imp.work_type_label, margin, y)
        y += 5
        pdf.setFont('helvetica', 'normal')
        pdf.text(imp.description, margin, y)
        y += 5
        pdf.text(
          `Est. cost: £${imp.estimated_cost.toLocaleString()} | Est. value added: £${imp.value_added.toLocaleString()} | Approval: ${Math.round(imp.approval_probability * 100)}%`,
          margin,
          y
        )
        y += 8
      })
    }

    // Footer
    const footerY = pageHeight - 15
    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'italic')
    pdf.text(
      'This report is indicative. Data: Ibex / Land Registry. See our methodology and disclaimers online.',
      margin,
      footerY
    )

    pdf.save('renovation-optimiser-report.pdf')
  }, [inputs, analyseResult])

  if (!analyseResult) return null

  return (
    <div>
      <button
        type="button"
        onClick={handleDownload}
        className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2"
        aria-label="Download PDF report"
      >
        Download report (PDF)
      </button>
    </div>
  )
}
