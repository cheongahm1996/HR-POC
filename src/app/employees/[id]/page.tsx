import EmployeeDetailClient from './EmployeeDetailClient';

// Generate static params for all employee IDs
export function generateStaticParams() {
  // Generate paths for 400 employees
  const paths = [];
  for (let i = 1; i <= 400; i++) {
    paths.push({
      id: `EMP${String(i).padStart(4, '0')}`
    });
  }
  return paths;
}

export default async function EmployeeDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  return <EmployeeDetailClient params={{ id }} />;
}