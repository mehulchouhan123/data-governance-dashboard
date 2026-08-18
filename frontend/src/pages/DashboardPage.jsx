import { Link } from "react-router-dom";

function DashboardPage() {
  return (
    <div>
      <h1>Data Governance Dashboard</h1>

      <p>
        Manage and explore your datasets.
      </p>

      <div>
        <Link to="/upload">
          Upload Dataset
        </Link>
      </div>

      <br />

      <div>
        <Link to="/discovery">
          Data Discovery
        </Link>
      </div>
    </div>
  );
}

export default DashboardPage;