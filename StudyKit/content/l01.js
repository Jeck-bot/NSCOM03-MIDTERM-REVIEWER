/* L01 — Review of the Physical and Data Link Layers (18 slides). Owner: Lead (taken over from O1). */
(function () {
  'use strict';
  var T = 'l01';
  function ref(p) { return ' <span class="chip ref">' + p + '</span>'; }

  KIT.topic({
    id: T,
    lecture: 1,
    title: 'Review of the Physical & Data Link Layers',
    blurb: 'Where this course lives in the OSI and TCP/IP stacks, what the data link and physical layers do, the kinds of networks, and why digital data is sometimes sent as an analog signal.',
    highYield: ['OSI ↔ TCP/IP mapping', 'Data link layer services', 'LAN ≤ 5 km · WAN · wireless', 'IEEE 802 series', 'Why analog transmission'],
    glance: [
      'OSI has <b>7 layers</b> (bottom-up: Physical, Data link, Network, Transport, Session, Presentation, Application). The slides’ TCP/IP model has <b>4</b>: Network access (OSI 1–2), Internet (3), Transport (4), Application (5–7). This course lives in the <b>bottom two</b>.',
      'The <b>data link layer</b> formats data into <b>frames</b> and moves them error-free between two end nodes over the physical layer. Its services: framing, frame sequencing, flow control, error detection (sometimes correction), and QoS.',
      '<b>LAN</b>: typically within <b>5 km</b>, copper or fiber, IEEE 802 standards. <b>WAN</b>: long distance — fiber (dark fiber = unused), submarine cable, satellite and terrestrial microwave. <b>Wireless</b>: unguided media, short or long range, organized in cells.',
      '<b>IEEE</b> took over LAN standards (physical + data link layers) using OSI as the framework: 802.3 Ethernet (CSMA/CD), 802.5 token ring, 802.11 wireless LAN, 802.16 wireless local loop.',
      '<b>Media access control (MAC)</b> coordinates nodes on a shared medium — <b>ALOHA style</b> or <b>token style</b>.',
      'The <b>physical layer</b> turns frames into electrical, optical or electromagnetic signals. <b>Analog transmission</b> is needed when bandwidth is limited: a <b>modulator</b> turns digital into analog and a <b>demodulator</b> turns it back.'
    ],
    ask: [
      '<b>MCQ:</b> which layer does what; which protocol or device sits at which layer; the TCP/IP ↔ OSI mapping; LAN distance; IEEE 802 numbers.',
      '<b>Identification:</b> dark fiber, framing, frame sequencing, QoS, IEEE, physical layer, modulator/demodulator, cell.',
      '<b>Essay:</b> explain the purpose and services of the data link layer; why analog transmission is used; compare LAN, WAN and wireless networks.',
      '<b>MCQ:</b> Starlink facts (550 km; 775 satellites by October 2020); ALOHA style vs token style MAC.'
    ],
    sections: [
      { kind: 'intuition', title: 'Layers are like a postal system', fig: 'l01.osi',
        analogy: 'A letter goes into an envelope, the envelope into a mailbag, the mailbag onto a truck. Each layer wraps the one above and only talks to its own counterpart at the other end. ' +
          'The <b>data link layer</b> is the hand-off between two <i>neighbouring</i> post offices (one hop, in frames); the <b>physical layer</b> is the road itself — the signals on the wire.',
        predict: [
          { q: 'A switch forwards frames between two computers on the same LAN. Which OSI layer is it working at?',
            choices: ['Physical', 'Data link', 'Network', 'Transport'], answer: 1,
            explain: 'Switches and bridges handle <b>frames</b>, so they work at the data link layer — slide 2 lists them there. Hubs and repeaters only repeat signals (physical layer).' },
          { q: 'A medium only passes a limited band of frequencies, so a square digital signal comes out badly distorted. What do the slides prescribe?',
            choices: ['Send it with more voltage', 'Modulate it onto an analog signal (modulator/demodulator)', 'Split it into smaller frames'], answer: 1,
            explain: 'Slide 17: analog transmission is needed when bandwidth is limited — the digital signal is modulated into an analog signal, transmitted, and demodulated at the other end.' }
        ] },

      { kind: 'notes', id: 'osi', title: 'The OSI and TCP/IP models', ref: 'L01 pp2-3', html:
        '<p>The slide’s OSI table (a generic web graphic) gives each layer a one-line role and examples:' + ref('L01 p2') + '</p>' +
        '<div class="table-wrap"><table class="tbl compact"><thead><tr><th>#</th><th>OSI layer</th><th>Role (slide)</th><th>Examples (slide)</th></tr></thead><tbody>' +
        '<tr><td>7</td><td><b>Application</b></td><td>End-user layer</td><td>HTTP, FTP, IRC, SSH, DNS</td></tr>' +
        '<tr><td>6</td><td><b>Presentation</b></td><td>Syntax layer</td><td>SSL, SSH, IMAP, FTP, MPEG, JPEG</td></tr>' +
        '<tr><td>5</td><td><b>Session</b></td><td>Synch &amp; send to port</td><td>APIs, sockets, WinSock</td></tr>' +
        '<tr><td>4</td><td><b>Transport</b></td><td>End-to-end connections</td><td>TCP, UDP</td></tr>' +
        '<tr><td>3</td><td><b>Network</b></td><td>Packets</td><td>IP, ICMP, IPSec, IGMP</td></tr>' +
        '<tr><td>2</td><td><b>Data link</b></td><td>Frames</td><td>Ethernet, PPP, switch, bridge</td></tr>' +
        '<tr><td>1</td><td><b>Physical</b></td><td>Physical structure</td><td>Coax, fiber, wireless, hubs, repeaters</td></tr></tbody></table></div>' +
        '<p>The slides compare it with a <b>4-layer TCP/IP (Internet) model</b>: <b>Application</b> = OSI 7, 6 and 5; <b>Transport</b> = OSI 4; <b>Internet</b> = OSI 3; ' +
        '<b>Network access</b> = OSI 2 and 1.' + ref('L01 p3') + '</p>' +
        '<div class="callout slide-error"><div class="callout-label">⚠ Slide says / correct</div><div class="says-correct">' +
        '<b>Slide 2</b><span>FTP and SSH appear at two layers; IMAP and SSL sit at Presentation.</span>' +
        '<b>Correct</b><span>FTP, SSH and IMAP are application-layer protocols. Know the slide’s table for the exam, but don’t be surprised if a question treats them as application protocols.</span>' +
        '<b>Slide 3</b><span>TCP/IP has 4 layers (Network access = OSI 1–2).</span>' +
        '<b>Also</b><span>The textbook (Forouzan) uses a 5-layer TCP/IP model — physical, data link, network, transport, application. Same functions, different grouping.</span></div></div>' },

      { kind: 'notes', id: 'dll', title: 'The data link layer', ref: 'L01 pp4-5', html:
        '<p><b>Purpose:</b> to regulate and format the transmission of data from software on a node to the network cabling. It creates the network environment for the “wire” and dictates ' +
        'data formats, timing, bit sequencing and other activities for each type of network, so that <b>data frames are transmitted error-free between two end nodes over the physical layer</b>.' + ref('L01 p4') + '</p>' +
        '<p><b>Services it gives the upper layers</b>' + ref('L01 p5') + ':</p><ul>' +
        '<li><b>Provisioning links</b> between network entities — generally adjacent nodes within a subnetwork.</li>' +
        '<li><b>Framing</b> — partitioning data into frames with recognized frame boundaries and exchanging them over the link.</li>' +
        '<li><b>Frame sequencing</b> — keeping frames in the correct order as they are exchanged.</li>' +
        '<li><b>Flow control</b> — establishing and maintaining an acceptable flow as frames cross the link.</li>' +
        '<li><b>Error detection</b> — detecting physical-layer errors, with notification when errors are detected but not corrected; it <b>can sometimes correct</b> errors too.</li>' +
        '<li><b>Quality of service (QoS)</b> — selecting QoS parameters: sufficient bandwidth available, and transmission delays that are predictable and guaranteed.</li></ul>' },

      { kind: 'notes', id: 'networks', title: 'Types of networks', ref: 'L01 pp6-12', html:
        '<p>The data link layer serves three kinds of networks:' + ref('L01 p6') + '</p>' +
        '<table class="tbl compact"><thead><tr><th>Type</th><th>What the slides say</th></tr></thead><tbody>' +
        '<tr><td><b>LAN</b> — local area network</td><td>Typically within <b>5 km</b>; computers are normally adjacent; interconnected with <b>copper or fiber</b>; typically uses the <b>IEEE 802</b> series.' + ref('L01 p7') + '</td></tr>' +
        '<tr><td><b>WAN</b> — wide area network</td><td>Geographically long-distance connections: literally a long cable, normally <b>fiber optic</b>; <b>microwave</b> via satellites or terrestrial links.' + ref('L01 p10') + '</td></tr>' +
        '<tr><td><b>Wireless network</b></td><td>Unguided media; short or long distance; radio signals (also microwave).' + ref('L01 p12') + '</td></tr></tbody></table>' +
        '<h4>IEEE and the LAN</h4><p>In the early days there were no standards: organizations used proprietary networks and were locked into a vendor or technology. ' +
        'The <b>IEEE</b> took responsibility for setting LAN standards, primarily for the <b>physical and data link layers</b>, using the OSI reference model as a framework.' + ref('L01 p8') + '</p>' +
        '<div class="table-wrap"><table class="tbl compact"><thead><tr><th>Standard</th><th>Defines (slide 9)</th></tr></thead><tbody>' +
        '<tr><td>802.1</td><td>Architectural overview of LANs</td></tr><tr><td>802.2</td><td>Logical Link Control (LLC)</td></tr>' +
        '<tr><td><b>802.3</b></td><td><b>CSMA/CD — Ethernet</b> (802.3u Fast Ethernet 100 Mbps; 802.3z/802.3ab Gigabit; 802.3ae 10-Gigabit)</td></tr>' +
        '<tr><td>802.4</td><td>Token bus</td></tr><tr><td><b>802.5</b></td><td><b>Token ring</b> (logical ring, token passing)</td></tr>' +
        '<tr><td>802.6</td><td>Metropolitan area networks (MANs)</td></tr><tr><td>802.7</td><td>Broadband LANs (video, data, voice)</td></tr>' +
        '<tr><td>802.9</td><td>Integrated Services LANs (ISLANs)</td></tr><tr><td>802.10</td><td>LAN/MAN security</td></tr>' +
        '<tr><td><b>802.11</b></td><td><b>Wireless</b> media access control and physical layer</td></tr><tr><td>802.12</td><td>Demand priority (100VG-AnyLAN)</td></tr>' +
        '<tr><td>802.13</td><td>Nothing — skipped over superstition about “13”</td></tr><tr><td>802.14</td><td>Cable-TV broadband</td></tr>' +
        '<tr><td>802.16</td><td>Wireless local loop (WLL)</td></tr></tbody></table></div>' +
        '<h4>WAN media</h4><ul>' +
        '<li><b>Fiber optic</b> is the norm. <b>Dark fiber</b> = unused fiber-optic cable. Examples: <b>submarine cable</b>, fiber laid beside roads or commuter-train railways.' + ref('L01 p10') + '</li>' +
        '<li><b>Microwave</b>: <b>satellites</b> orbiting the earth (uplink and downlink between ground stations) and <b>terrestrial microwave links</b>.' + ref('L01 p10') + '</li>' +
        '<li><b>SpaceX Starlink</b>: satellites deployed globally at <b>550 km</b> above the earth to bring high-speed broadband where access is unreliable, expensive or unavailable; ' +
        '<b>775 satellites</b> launched as of October 2020.' + ref('L01 p11') + '</li></ul>' +
        '<h4>Wireless networks</h4><p>Use radio signals (also microwave); can be a personal, local or wide area network; use a <b>“cell”</b> to interconnect mobile devices. ' +
        'Examples: <b>Bluetooth</b>, the <b>IEEE 802.11</b> series, the <b>LTE</b> mobile phone network. The slide’s cellular diagram shows a call being set up through the switch ' +
        '(MTSO): it verifies both phones as valid subscribers, finds voice channels, locates phone B’s strongest cell, connects the voice path, and monitors the call for hand-off.' + ref('L01 p12') + '</p>' },

      { kind: 'notes', id: 'mac', title: 'Media access control (MAC)', ref: 'L01 p13', html:
        '<p>The MAC layer establishes <b>coordination between nodes</b> so that a node can gain access to the shared medium and transmit. There are different techniques; the slides name two families, <b>ALOHA style</b> and <b>token style</b>.' + ref('L01 p13') + ' <span class="badge beyond">Beyond slides</span> In the textbook, ALOHA style means contention (stations transmit and deal with collisions) and token style means a station may send only while it holds the token.</p>' },

      { kind: 'notes', id: 'phy', title: 'The physical layer and signal transmission', ref: 'L01 pp14-17', html:
        '<p>The <b>physical layer</b> translates frames from the data link layer into <b>electrical, optical or electromagnetic signals</b> representing 0s and 1s. Its specification covers the type of ' +
        'cable and connectors, the electrical signal on each pin, and how bit values become physical signals.' + ref('L01 p14') + '</p>' +
        '<ul><li><b>Analog communication</b>: the signal varies continuously in strength or quantity (e.g. voltage); data is represented by varying the <b>voltage</b> (amplitude), the <b>frequency</b> ' +
        'or the <b>phase</b> of a wave.' + ref('L01 p15') + '</li>' +
        '<li><b>Digital communication</b>: the signal is coded in binary — e.g. a 1 as <b>+5 V</b> and a 0 as <b>0 V</b>.' + ref('L01 p15') + '</li></ul>' +
        '<figure data-fig="l01.analog" data-bits="010010"></figure>' +
        '<h4>Why use analog transmission?</h4><p>Analog transmission is needed <b>when bandwidth is limited</b>: a medium with limited bandwidth does not let a digital signal pass through, ' +
        'so digital signals are <b>modulated</b> into analog signals and transmitted over the medium, then <b>demodulated</b> at the far end. For two-way traffic, each direction has its own ' +
        'modulator and demodulator.' + ref('L01 p17') + '</p>' +
        '<div class="callout key"><div class="callout-label">Connects to</div>L02 explains <i>why</i> limited bandwidth distorts a digital signal (low-pass vs bandpass channels), and L04 covers the modulation schemes (ASK, FSK, PSK, QAM).</div>' },

      { kind: 'example', title: 'Placing devices and protocols on the stack', ref: 'L01 p2; L01 p3', html:
        '<p><b>Task:</b> say which OSI layer, and which slide TCP/IP layer, each item belongs to: <i>switch, repeater, TCP, IP, HTTP, Ethernet</i>.</p>' +
        '<ol class="steps"><li><b>Repeater</b> — only regenerates signals → OSI 1 Physical → TCP/IP Network access.</li>' +
        '<li><b>Switch</b> and <b>Ethernet</b> — work with frames → OSI 2 Data link → Network access.</li>' +
        '<li><b>IP</b> — packets → OSI 3 Network → Internet.</li><li><b>TCP</b> — end-to-end connections → OSI 4 Transport → Transport.</li>' +
        '<li><b>HTTP</b> — end-user application → OSI 7 Application → Application.</li></ol>' },

      { kind: 'quick', n: 8 },
      { kind: 'traps', items: [
        { trap: 'Mixing up the order of the layers', fix: 'Bottom-up: Physical, Data link, Network, Transport, Session, Presentation, Application (“Please Do Not Throw Sausage Pizza Away”).', ref: 'L01 p2' },
        { trap: 'Mapping TCP/IP’s Internet layer to OSI 2', fix: 'Internet = OSI 3 (Network). Network access = OSI 1–2.', ref: 'L01 p3' },
        { trap: 'Saying a LAN spans tens of kilometres', fix: 'The slides: typically within 5 km.', ref: 'L01 p7' },
        { trap: 'Thinking “dark fiber” is a special kind of fiber', fix: 'It is simply unused (unlit) fiber-optic cable.', ref: 'L01 p10' },
        { trap: 'Saying analog is used because it is faster', fix: 'It is used when bandwidth is limited and a digital signal cannot pass through the medium.', ref: 'L01 p17' },
        { trap: 'Putting routing in the data link layer', fix: 'The data link layer works between adjacent nodes (frames); routing packets between networks is the network layer’s job.', ref: 'L01 p5' }
      ] },
      { kind: 'mnemonics', items: [
        'Bottom-up OSI: “<b>P</b>lease <b>D</b>o <b>N</b>ot <b>T</b>hrow <b>S</b>ausage <b>P</b>izza <b>A</b>way”. Top-down: “<b>A</b>ll <b>P</b>eople <b>S</b>eem <b>T</b>o <b>N</b>eed <b>D</b>ata <b>P</b>rocessing”.',
        'TCP/IP on the slides: 4 layers cover the 7 OSI layers as 3 + 1 + 1 + 2 — Application 3, Transport 1, Internet 1, Network access 2.',
        'DLL services — “<b>F</b>ramed <b>S</b>equences <b>F</b>low <b>E</b>rror-free with <b>Q</b>uality”: framing, sequencing, flow control, error detection, QoS.',
        'IEEE 802 favourites: <b>.3</b> Ethernet, <b>.5</b> token ring, <b>.11</b> Wi-Fi, <b>.13</b> nothing (unlucky).',
        'Starlink: “<b>550</b> up, <b>775</b> launched by October 2020”.'
      ] },
      { kind: 'recall', prompts: [
        'Draw the OSI stack and the slides’ 4-layer TCP/IP model side by side, with the mapping.',
        'State the purpose of the data link layer and list its six services.',
        'Compare LAN, WAN and wireless networks: distance, media, examples.',
        'Why did IEEE take over LAN standards, and which layers do they cover? Name four 802 standards.',
        'Name the two styles of media access control.',
        'Explain why digital data is sometimes sent as an analog signal.'
      ] }
    ],
    slideErrors: [
      { ref: 'L01 p2', says: 'FTP and SSH appear under both Application and Presentation; IMAP and SSL under Presentation', correct: 'FTP, SSH and IMAP are application-layer protocols (the table is a generic web graphic). Learn the slide’s table, but expect them to be called application protocols elsewhere.' },
      { ref: 'L01 p3', says: 'A 4-layer TCP/IP model', correct: 'The textbook (Forouzan) uses 5 layers: physical, data link, network, transport, application.' },
      { ref: 'L01 p9', says: 'The 802 list skips 802.8 and 802.15 and calls 802.3c “10 Mbps Ethernet”', correct: '802.15 is the wireless PAN group (Bluetooth) and 802.8 was the fiber-optic advisory group; 10BASE-T is 802.3i.' },
      { ref: 'L01 p10', says: 'The “terrestrial microwave” picture shows ground-wave and sky-wave (ionosphere) paths', correct: 'Terrestrial microwave is line-of-sight between antennas on towers.' },
      { ref: 'L01 p16', says: '“Multipelxed Sum”', correct: 'Typo for “multiplexed”.' }
    ],
    glossary: [
      { term: 'OSI model', def: 'Seven-layer reference model: physical, data link, network, transport, session, presentation, application.', ref: 'L01 p2' },
      { term: 'TCP/IP model', alt: ['Internet model'], def: 'On the slides, 4 layers: application (OSI 5–7), transport (4), internet (3), network access (1–2).', ref: 'L01 p3' },
      { term: 'Data link layer', def: 'Formats data into frames and moves them error-free between two end nodes over the physical layer.', ref: 'L01 p4' },
      { term: 'Framing', def: 'Partitioning data into frames with recognized boundaries and exchanging them over the link.', ref: 'L01 p5' },
      { term: 'Frame sequencing', def: 'Keeping frames in the correct order as they are exchanged.', ref: 'L01 p5' },
      { term: 'Flow control', def: 'Keeping the flow of frames across a link at an acceptable level.', ref: 'L01 p5' },
      { term: 'Quality of service (QoS)', alt: ['QoS'], def: 'Transmission parameters such as sufficient bandwidth and predictable, guaranteed delays.', ref: 'L01 p5' },
      { term: 'LAN', alt: ['local area network'], def: 'Network of computers typically within 5 km, over copper or fiber, usually IEEE 802.', ref: 'L01 p6; L01 p7' },
      { term: 'WAN', alt: ['wide area network'], def: 'Geographically long-distance network: fiber (incl. submarine cable), satellite or terrestrial microwave.', ref: 'L01 p6; L01 p10' },
      { term: 'Wireless network', def: 'Network over unguided media (radio, microwave); can be short or long distance; uses cells.', ref: 'L01 p6; L01 p12' },
      { term: 'IEEE 802', def: 'The IEEE family of LAN standards for the physical and data link layers (802.3 Ethernet, 802.5 token ring, 802.11 wireless, …).', ref: 'L01 p8; L01 p9' },
      { term: 'Dark fiber', def: 'Unused fiber-optic cable.', ref: 'L01 p10' },
      { term: 'Starlink', def: 'SpaceX satellite constellation at 550 km bringing broadband to poorly served areas (775 satellites by October 2020).', ref: 'L01 p11' },
      { term: 'Media access control (MAC)', alt: ['MAC'], def: 'Coordination that lets a node gain access to a shared medium; ALOHA style or token style.', ref: 'L01 p13' },
      { term: 'Physical layer', def: 'Turns frames into electrical, optical or electromagnetic signals; specifies cables, connectors and signal levels.', ref: 'L01 p14' },
      { term: 'Analog signal', def: 'A signal that varies continuously; data rides on its amplitude, frequency or phase.', ref: 'L01 p15' },
      { term: 'Digital signal', def: 'A signal coded in binary levels — e.g. 1 = +5 V, 0 = 0 V.', ref: 'L01 p15' },
      { term: 'Modulator / demodulator', alt: ['modem'], def: 'The modulator turns a digital signal into an analog one for transmission; the demodulator turns it back.', ref: 'L01 p17' }
    ],
    cheat: [
      { title: 'L01 · Layers & data link', html: '<ul>' +
        '<li>OSI bottom-up: <em class="k">Physical, Data link, Network, Transport, Session, Presentation, Application</em></li>' +
        '<li>Slide TCP/IP (4): Application = OSI 5–7 · Transport = 4 · <em class="k">Internet = 3</em> · <em class="k">Network access = 1–2</em></li>' +
        '<li>Slide 2 examples: switch, bridge, Ethernet, PPP → L2; hubs, repeaters, coax, fiber → L1; IP → L3; TCP/UDP → L4</li>' +
        '<li>DLL: frames moved <em class="k">error-free between two end nodes</em> over the physical layer</li>' +
        '<li>DLL services: <em class="k">framing</em>, frame sequencing, flow control, error detection (sometimes correction), <em class="k">QoS</em></li>' +
        '<li>Physical layer: frames → electrical/optical/electromagnetic signals; cables, connectors, pins</li></ul>' },
      { title: 'L01 · Networks & signals', html: '<ul>' +
        '<li>LAN typically within <em class="k">5 km</em>, copper/fiber, IEEE 802 · WAN: fiber, submarine cable, satellite & terrestrial microwave</li>' +
        '<li><em class="k">Dark fiber</em> = unused fiber · Starlink <em class="k">550 km</em>, 775 satellites (Oct 2020)</li>' +
        '<li>Wireless: unguided, cells; Bluetooth, 802.11, LTE</li>' +
        '<li>IEEE 802: .2 LLC · <em class="k">.3 Ethernet (CSMA/CD)</em> · .4 token bus · .5 token ring · .11 wireless · .13 none · .16 WLL</li>' +
        '<li>MAC styles: <em class="k">ALOHA style</em> vs <em class="k">token style</em></li>' +
        '<li>Analog: vary amplitude/frequency/phase · Digital: e.g. 1 = +5 V, 0 = 0 V</li>' +
        '<li>Analog transmission when <em class="k">bandwidth is limited</em> → modulator / demodulator</li></ul>' }
    ]
  });
})();
