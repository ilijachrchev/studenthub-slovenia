import { QRCodeSVG } from "qrcode.react";

function Ticket({ ticketCode }) {
    return (
        <div className="ticket">
            <div className="ticket-qr">
                <QRCodeSVG />
            </div>
            <p className="ticket-label">Your ticket</p>
            <p className="ticket-code">{ticketCode}</p>
            <p className="ticket-note">Show this QR code at the entrance.</p>
        </div>
    );
}

export default Ticket;