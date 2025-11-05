function runSimulation() {
    const N = parseInt(document.getElementById("numFrames").value);
    const W = parseInt(document.getElementById("winSize").value);
    const T = parseInt(document.getElementById("timePerFrame").value);
    const animate = document.getElementById("animate").checked;
    const errorType = document.getElementById("errorType").value;

    const canvas = document.getElementById("timeline");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set font
    ctx.font = "14px Segoe UI";
    ctx.textBaseline = "middle";
    ctx.lineWidth = 2;

    const ySender = 80, yReceiver = 300;
    const margin = 80;
    const availableWidth = canvas.width - 2 * margin;
    const totalTimeUnits = (2 * T) * N + 4; // extra for errors
    const unitWidth = Math.max(20, availableWidth / totalTimeUnits);

    // Draw timelines
    ctx.strokeStyle = "#aaa";
    ctx.beginPath();
    ctx.moveTo(margin, ySender);
    ctx.lineTo(canvas.width - margin, ySender);
    ctx.moveTo(margin, yReceiver);
    ctx.lineTo(canvas.width - margin, yReceiver);
    ctx.stroke();

    ctx.fillStyle = "#333";
    ctx.fillText("Sender", 10, ySender);
    ctx.fillText("Receiver", 10, yReceiver);

    let events = [];
    let time = 0;

    // Build events with simulated errors
    for (let i = 1; i <= N; i++) {
        let e = {
            frame: i,
            send: time,
            recv: time + T,
            ackSend: time + T,
            ackRecv: time + 2 * T,
            error: null,
            resend: false
        };

        if (errorType === "feedback_lost" && i === 2) {
            e.error = "feedback_lost";
            e.resend = true;
            e.ackRecv += 2 * T;
            time = e.ackRecv;
        } else if (errorType === "ack_lost" && i === 3) {
            e.error = "ack_lost";
            e.resend = true;
            e.ackRecv += 2 * T;
            time = e.ackRecv;
        } else if (errorType === "ack_timeout" && i === 4) {
            e.error = "ack_timeout";
            e.resend = true;
            e.ackRecv += 2 * T;
            time = e.ackRecv;
        } else {
            time = e.ackRecv;
        }

        events.push(e);
    }

    const drawFrame = (f) => {
        const x1 = margin + f.send * unitWidth;
        const x2 = margin + f.recv * unitWidth;
        const y1 = ySender, y2 = yReceiver;

        // FRAME
        ctx.strokeStyle = f.error === "feedback_lost" ? "red" : "#007acc";
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        drawArrowHead(ctx, x2, y2, Math.PI / 4);
        ctx.fillStyle = "#000";
        ctx.fillText("Frame " + f.frame, x1 + 5, y1 - 15);
        if (f.error === "feedback_lost") {
            ctx.fillStyle = "red";
            ctx.fillText("Frame Lost!", x2 + 5, y2 + 15);
        }

        // ACK
        const xa1 = margin + f.ackSend * unitWidth;
        const xa2 = margin + f.ackRecv * unitWidth;
        ctx.strokeStyle = (f.error === "ack_lost" || f.error === "ack_timeout") ? "orange" : "#28a745";
        ctx.beginPath();
        ctx.moveTo(xa1, y2);
        ctx.lineTo(xa2, y1);
        ctx.stroke();
        drawArrowHead(ctx, xa2, y1, -Math.PI / 4);
        ctx.fillStyle = "#000";
        ctx.fillText("ACK " + f.frame, xa1 + 5, y2 + 15);
        if (f.error === "ack_lost") {
            ctx.fillStyle = "orange";
            ctx.fillText("ACK Lost!", xa2 + 5, y1 - 15);
        } else if (f.error === "ack_timeout") {
            ctx.fillStyle = "orange";
            ctx.fillText("ACK Timeout!", xa2 + 5, y1 - 15);
        }

        // RESEND
        if (f.resend) {
            const resendX1 = xa2 + 1 * unitWidth;
            const resendX2 = resendX1 + T * unitWidth;
            ctx.strokeStyle = "purple";
            ctx.beginPath();
            ctx.moveTo(resendX1, y1);
            ctx.lineTo(resendX2, y2);
            ctx.stroke();
            drawArrowHead(ctx, resendX2, y2, Math.PI / 4);
            ctx.fillStyle = "purple";
            ctx.fillText("Resend Frame " + f.frame, resendX1 + 5, y1 - 30);
        }
    };

    if (animate) {
        let i = 0;
        const interval = setInterval(() => {
            drawFrame(events[i]);
            i++;
            if (i >= events.length) clearInterval(interval);
        }, 800);
    } else {
        for (const f of events) drawFrame(f);
    }

    const framesTx = N + events.filter(e => e.resend).length;
    const acksTx = N;
    const efficiency = ((N / framesTx) * 100).toFixed(2) + "%";

    document.getElementById("framesTx").innerText = framesTx;
    document.getElementById("acksTx").innerText = acksTx;
    document.getElementById("totalTime").innerText = time + " units";
    document.getElementById("efficiency").innerText = efficiency;
}

function drawArrowHead(ctx, x, y, angle) {
    const len = 8;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - len * Math.cos(angle - 0.3), y - len * Math.sin(angle - 0.3));
    ctx.moveTo(x, y);
    ctx.lineTo(x - len * Math.cos(angle + 0.3), y - len * Math.sin(angle + 0.3));
    ctx.stroke();
}
function showDevelopedBy() {
    alert(
`Team Members:
1. Niranjan Kumar S - 24BCE1769
2. Subhasri Balachandiran - 24BCE1833
3. Ranse Roger J - 24BCE1531

Supervisor/Mentor: DR. SWAMINATHAN`
    );
}

function showHelp() {
    alert(
`How to use the simulator:
1. Enter number of frames, window size, time per frame.
2. Select error type.
3. Click Simulate.
4. The timeline diagram and stats will be displayed below.`
    );
}

function downloadSummary() {
    const summary = `
Sliding Window Protocol Simulator Summary

Number of Frames: ${document.getElementById("numFrames").value}
Window Size: ${document.getElementById("winSize").value}
Time per Frame: ${document.getElementById("timePerFrame").value}
Total Frames Transmitted: ${document.getElementById("framesTx").innerText}
Total ACKs Sent: ${document.getElementById("acksTx").innerText}
Total Time Units: ${document.getElementById("totalTime").innerText}
Efficiency: ${document.getElementById("efficiency").innerText}
`;
    const blob = new Blob([summary], {type: "text/plain"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "simulation_summary.txt";
    a.click();
    URL.revokeObjectURL(url);
}

// Add this function at the end of your existing script.js
function downloadSummary() {
    const framesTx = document.getElementById("framesTx").innerText;
    const acksTx = document.getElementById("acksTx").innerText;
    const totalTime = document.getElementById("totalTime").innerText;
    const efficiency = document.getElementById("efficiency").innerText;

    let content = `Simplest Sliding Window Protocol Simulator (With Errors)\n\n`;
    content += `Summary Statistics:\n`;
    content += `Total Frames Transmitted: ${framesTx}\n`;
    content += `Total ACKs Sent: ${acksTx}\n`;
    content += `Total Time Units: ${totalTime}\n`;
    content += `Efficiency: ${efficiency}\n\n`;

    content += `Instructions & Steps:\n`;
    content += `1. Input your parameters: Number of Frames, Window Size, Time per Frame, Error Type.\n`;
    content += `2. Click Simulate to view the timeline diagram.\n`;
    content += `3. Check summary statistics below the diagram.\n`;
    content += `4. This file contains the results and detailed steps for reference.\n\n`;

    content += `Developed By:\n`;
    content += `1. Niranjan Kumar S - 24BCE1769\n`;
    content += `2. Subhasri Balachandiran - 24BCE1833\n`;
    content += `3. Ranse Roger J - 24BCE1531\n`;
    content += `Supervisor/Mentor: DR. SWAMINATHAN\n`;

    // Create a Blob and download
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "SlidingWindow_Summary.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}


