import { listMeetingRequests } from "@repo/api";
import { MeetingRequestsTable } from "@/components/meeting-requests-table";

export default async function AdminMeetingRequestsPage() {
  const requests = await listMeetingRequests();

  return (
    <MeetingRequestsTable
      requests={requests.map((request) => ({ ...request, _id: String(request._id) }))}
    />
  );
}