export const UpdateAuditLogsRetentionRetentionPeriod = {
  Value1Month: '1_MONTH',
  Value2Months: '2_MONTHS',
  Value3Months: '3_MONTHS',
  Value4Months: '4_MONTHS',
  Value5Months: '5_MONTHS',
  Value6Months: '6_MONTHS',
  Value7Months: '7_MONTHS',
  Value8Months: '8_MONTHS',
  Value9Months: '9_MONTHS',
  Value10Months: '10_MONTHS',
  Value11Months: '11_MONTHS',
  Value1Year: '1_YEAR',
  Value2Years: '2_YEARS',
  Value3Years: '3_YEARS',
  Value4Years: '4_YEARS',
  Value5Years: '5_YEARS',
  Value6Years: '6_YEARS',
  Value7Years: '7_YEARS',
  Value8Years: '8_YEARS',
  Value9Years: '9_YEARS',
  Value10Years: '10_YEARS',
} as const;

export type UpdateAuditLogsRetentionRetentionPeriod =
  (typeof UpdateAuditLogsRetentionRetentionPeriod)[keyof typeof UpdateAuditLogsRetentionRetentionPeriod];
