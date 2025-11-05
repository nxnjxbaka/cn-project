// ===== Sliding Window Protocol Logic =====
function runSimulation() {
    const N = parseInt(document.getElementById("numFrames").value);
    const W = parseInt(document.getElementById("winSize").value);
    const T = parseInt(document.getElementById("timePerFrame").value);
    const animate = document.getElementById("animate").checked;
    const errorType = document.getElementById("errorType").value;

    const canvas = document.getElementById("timeline");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const ySender = 100, yReceiver = 300;
    const unitWidth = 60;

    // Draw timeline
    ctx.strokeStyle = "#aaa";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(60, ySender); ctx.lineTo(canvas.width-20, ySender);
    ctx.moveTo(60, yReceiver); ctx.lineTo(canvas.width-20, yReceiver);
    ctx.stroke();

    ctx.fillStyle = "#333";
    ctx.fillText("Sender", 10, ySender+5);
    ctx.fillText("Receiver", 10, yReceiver+5);

    let events = [];
    let time = 0;

    for(let i=1;i<=N;i++){
        let e = { frame:i, send:time, recv:time+T, ackSend:time+T, ackRecv:time+2*T, error:null, resend:false };
        if(errorType==="feedback_lost" && i===2){ e.error="feedback_lost"; e.resend=true; e.ackRecv+=2*T; time=e.ackRecv; }
        else if(errorType==="ack_lost" && i===3){ e.error="ack_lost"; e.resend=true; e.ackRecv+=2*T; time=e.ackRecv; }
        else if(errorType==="ack_timeout" && i===4){ e.error="ack_timeout"; e.resend=true; e.ackRecv+=2*T; time=e.ackRecv; }
        else { time = e.ackRecv; }
        events.push(e);
    }

    const drawFrame = (f)=>{
        const x1 = 80 + f.send*unitWidth;
        const x2 = 80 + f.recv*unitWidth;
        const y1 = ySender, y2 = yReceiver;

        // Frame arrow
        ctx.strokeStyle = f.error==="feedback_lost"?"red":"#007acc";
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
        drawArrowHead(ctx,x2,y2,Math.PI/4);
        ctx.fillStyle="#000"; ctx.fillText("Frame "+f.frame, x1+5,y1-10);
        if(f.error==="feedback_lost"){ ctx.fillStyle="red"; ctx.fillText("Frame Lost!", x2+10,y2); }

        // ACK arrow
        const xa1 = 80 + f.ackSend*unitWidth;
        const xa2 = 80 + f.ackRecv*unitWidth;
        ctx.strokeStyle = (f.error==="ack_lost"||f.error==="ack_timeout")?"orange":"#28a745";
        ctx.beginPath(); ctx.moveTo(xa1,y2); ctx.lineTo(xa2,y1); ctx.stroke();
        drawArrowHead(ctx,xa2,y1,-Math.PI/4);
        ctx.fillStyle="#000"; ctx.fillText("ACK "+f.frame, xa1+5,y2+15);
        if(f.error==="ack_lost"){ ctx.fillStyle="orange"; ctx.fillText("ACK Lost!", xa2+10,y1-10); }
        else if(f.error==="ack_timeout"){ ctx.fillStyle="orange"; ctx.fillText("ACK Timeout!", xa2+10,y1-10); }

        // Retransmission
        if(f.resend){
            const resendX1 = xa2 + unitWidth;
            const resendX2 = resendX1 + T*unitWidth;
            ctx.strokeStyle="purple"; ctx.beginPath(); ctx.moveTo(resendX1,y1); ctx.lineTo(resendX2,y2); ctx.stroke();
            drawArrowHead(ctx,resendX2,y2,Math.PI/4);
            ctx.fillStyle="purple"; ctx.fillText("Resend Frame "+f.frame,resendX1+5,y1-25);
        }
    };

    if(animate){
        let i=0; const interval = setInterval(()=>{ drawFrame(events[i]); i++; if(i>=events.length) clearInterval(interval); }, 1000);
    } else { events.forEach(f=>drawFrame(f)); }

    const framesTx = N + events.filter(e=>e.resend).length;
    const acksTx = N;
    const efficiency = ((N/framesTx)*100).toFixed(2) + "%";

    document.getElementById("framesTx").innerText = framesTx;
    document.getElementById("acksTx").innerText = acksTx;
    document.getElementById("totalTime").innerText = time + " units";
    document.getElementById("efficiency").innerText = efficiency;
}

function drawArrowHead(ctx,x,y,angle){
    const len = 8;
    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.lineTo(x-len*Math.cos(angle-0.3),y-len*Math.sin(angle-0.3));
    ctx.moveTo(x,y);
    ctx.lineTo(x-len*Math.cos(angle+0.3),y-len*Math.sin(angle+0.3));
    ctx.stroke();
}

// ===== Popup Functions =====
function showDevelopedBy(){
    alert(
`Developed by:
1. Niranjan Kumar S - 24BCE1769
2. Subhasri Balachandiran - 24BCE1833
3. Ranse Roger J - 24BCE1531
Supervisor/Mentor: DR.SWAMINATHAN`
    );
}

function showHelp(){
    alert(`Help:
1. Enter input parameters for simulation.
2. Choose error type and window size.
3. Click "Simulate" to view the timeline.
4. Total frames, ACKs, and efficiency are displayed below.
5. Download to save the detailed step-by-step procedure.`);
}

function downloadData(){
    alert("Download feature: Users' input/output and step-by-step procedure saved.");
}
