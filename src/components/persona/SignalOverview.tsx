import { PageHeader } from '@/components/common/PageHeader';
import { Grid, Row, Column } from '@/components/zen';
import { WebsiteDateFilter } from '@/components/input/WebsiteDateFilter';
import { useWebsiteSignal } from '@/components/hooks/queries/useWebsiteSignal'; // We need to create this hook
import styles from './SignalOverview.module.css';

export function SignalOverview({ websiteId }: { websiteId: string }) {
  const { data } = useWebsiteSignal(websiteId);

  // Group data
  // data is [{ source, persona, outcome, count }]

  // Calculate totals
  const totalSessions = data?.reduce((acc: number, curr: any) => acc + Number(curr.count), 0) || 0;

  // Pivot for visualizations
  const byPersona = aggregate(data, 'persona');
  const bySource = aggregate(data, 'source');
  const byOutcome = aggregate(data, 'outcome');

  return (
    <Grid>
      <Row>
        <Column>
          <PageHeader title="Signal Overview">
            <WebsiteDateFilter websiteId={websiteId} />
          </PageHeader>
        </Column>
      </Row>

      {/* Metrics Cards */}
      <Row>
        <MetricsCard
          label="Total Signal Volume"
          value={totalSessions}
          sublabel="Analyzed Sessions"
        />
        <MetricsCard
          label="Persona Rate"
          value={`${calculatePersonaRate(data)}%`}
          sublabel="Sessions with Persona"
        />
        <MetricsCard
          label="Conversion Rate"
          value={`${calculateConversionRate(data)}%`}
          sublabel="Overall"
        />
      </Row>

      {/* Flow Visualization (Simplified Sankey) */}
      <Row className={styles.flowContainer}>
        <FlowColumn
          title="Traffic Sources"
          data={bySource}
          total={totalSessions}
          color="var(--blue-500)"
        />
        <FlowConnector />
        <FlowColumn
          title="Personas"
          data={byPersona}
          total={totalSessions}
          color="var(--purple-500)"
        />
        <FlowConnector />
        <FlowColumn
          title="Outcomes"
          data={byOutcome}
          total={totalSessions}
          color="var(--green-500)"
        />
      </Row>
    </Grid>
  );
}

function FlowColumn({ title, data, total, color }: any) {
  return (
    <div className={styles.column}>
      <h3>{title}</h3>
      {data.map((item: any) => (
        <div key={item.key} className={styles.item}>
          <div
            className={styles.bar}
            style={{ width: `${(item.value / total) * 100}%`, backgroundColor: color }}
          ></div>
          <div className={styles.label}>
            <span>{item.key}</span>
            <span>{item.value}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function FlowConnector() {
  return <div className={styles.connector}>→</div>;
}

function MetricsCard({ label, value, sublabel }: any) {
  return (
    <Column className={styles.card}>
      <div className={styles.metricLabel}>{label}</div>
      <div className={styles.metricValue}>{value}</div>
      <div className={styles.metricSub}>{sublabel}</div>
    </Column>
  );
}
// Helper utils
function aggregate(data: any[], key: string) {
  if (!data) return [];
  const map = new Map();
  data.forEach(d => {
    const k = d[key];
    const v = Number(d.count);
    map.set(k, (map.get(k) || 0) + v);
  });
  return Array.from(map.entries())
    .map(([k, v]) => ({ key: k, value: v }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // Start with top 5
}

function calculatePersonaRate(data: any[]) {
  if (!data) return 0;
  const total = data.reduce((acc, curr) => acc + Number(curr.count), 0);
  const withPersona = data
    .filter(d => d.persona !== 'Unknown' && d.persona !== 'Explorer')
    .reduce((acc, curr) => acc + Number(curr.count), 0);
  return total ? Math.round((withPersona / total) * 100) : 0;
}

function calculateConversionRate(data: any[]) {
  if (!data) return 0;
  const total = data.reduce((acc, curr) => acc + Number(curr.count), 0);
  const converted = data
    .filter(d => d.outcome === 'Converted')
    .reduce((acc, curr) => acc + Number(curr.count), 0);
  return total ? Math.round((converted / total) * 100) : 0;
}
