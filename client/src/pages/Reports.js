import React, { useEffect, useState } from 'react';
import { DocumentArrowDownIcon, DocumentTextIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { vehicleService } from '../services/vehicleService';
import reportService from '../services/reportService';
import LoadingSpinner from '../components/LoadingSpinner';
import { ErrorState, PageHeader, expiryDays, vehicleArray } from '../components/FleetUI';
import toast from 'react-hot-toast';

export default function Reports() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [downloading, setDownloading] = useState(null);
  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      setVehicles(vehicleArray(await vehicleService.getAllVehicles()));
    }
    catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);
  const days = vehicles.flatMap(v => [expiryDays(v.insuranceExpiry), expiryDays(v.licenseExpiry)]).filter(d => d !== null);
  const stats = [['Total Vehicles', vehicles.length], ['Active / Available', vehicles.filter(v => ['active', 'available'].includes(v.status?.toLowerCase())).length], ['Expiring Documents', days.filter(d => d >= 0 && d <= 30).length], ['Expired Documents', days.filter(d => d < 0).length]];
  const download = async key => {
    setDownloading(key);
    const toastId = toast.loading('Generating report…');
    try {
      if (key === 'summary') await reportService.downloadVehicleSummaryReport();
      else await reportService.downloadExpiryAlertsReport(30);
      toast.success('Report downloaded', { id: toastId });
    } catch {
      toast.error('Unable to generate report. Please try again.', { id: toastId });
    }
    finally {
      setDownloading(null);
    }
  };
  const reports = [
    { key: 'summary', title: 'Vehicle Summary', description: 'A fleet overview with vehicle details, status and document expiry information.', icon: DocumentTextIcon },
    { key: 'expiry', title: 'Document Expiry', description: 'Review expired and upcoming document renewals to plan your next actions.', icon: ExclamationTriangleIcon }
  ];
  return <div className="fleet-page">
    <PageHeader eyebrow="FLEET INSIGHTS" title="Reports" description="Review fleet statistics and download reports for your team." />
    {loading ? <div className="py-16">
      <LoadingSpinner />
    </div> : error ? <ErrorState retry={load} /> : <>
      <div className="fleet-stats">
        {stats.map(([label, value], index) => <div className="fleet-stat" data-tone={['blue', 'green', 'amber', 'red'][index]} key={label}>
          <span>
            {label}
          </span>
          <strong>
            {value}
          </strong>
          <span className="text-xs">
            {label.includes('Documents') ? 'Insurance and vehicle licenses' : 'Current fleet records'}
          </span>
        </div>)}
      </div>
      <section className="fleet-panel">
        <div className="fleet-panel-header">
          <div>
            <h2>Available Reports</h2>
            <p>Download a PDF to share or keep for your records.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 sm:p-6">
          {reports.map(({ key, title, description, icon: Icon }) => <article className="fleet-report-card border rounded-xl p-5 sm:p-6 flex flex-col items-start" data-tone={key === 'summary' ? 'blue' : 'amber'} key={key}>
            <div className="fleet-feature-icon rounded-lg p-3 mb-5">
              <Icon className="h-6 w-6" />
            </div>
            <h3 className="font-semibold mb-2">
              {title}
            </h3>
            <p className="text-sm text-gray-500 mb-6 flex-1">
              {description}
            </p>
            <button className="btn btn-outline" disabled={downloading !== null} onClick={() => download(key)}>
              <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
              {downloading === key ? 'Generating…' : 'Download PDF'}
            </button>
          </article>)}
        </div>
      </section></>}
  </div>;
}
