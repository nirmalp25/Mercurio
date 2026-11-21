<!DOCTYPE html>
<html lang="en">
<body style="font-family: Arial, sans-serif; color: #222;">
    <h2>New product enquiry</h2>
    <table cellpadding="6" style="border-collapse: collapse;">
        <tr><td><strong>Product</strong></td><td>{{ $enquiry->productTitle }}</td></tr>
        <tr><td><strong>Name</strong></td><td>{{ $enquiry->name }}</td></tr>
        <tr><td><strong>Email</strong></td><td>{{ $enquiry->email }}</td></tr>
        <tr><td><strong>Phone</strong></td><td>{{ $enquiry->phone }}</td></tr>
        <tr><td><strong>Received</strong></td><td>{{ $enquiry->enquiredAt->format('Y-m-d H:i T') }}</td></tr>
    </table>
    <h3>Message</h3>
    <p style="white-space: pre-line;">{{ $enquiry->query }}</p>
</body>
</html>
