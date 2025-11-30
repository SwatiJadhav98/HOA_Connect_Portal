const Meeting = require("../../models/Meeting");
const MeetingAttendee = require("../../models/MeetingAttendee");

exports.getMeetingsByResident = async (req, res) => {
  try {
    const meetings = await Meeting.find({ community: req.user.community })
      .sort({ meetingDate: 1 }); // upcoming first

    res.json(meetings);
  } catch (err) {
    res.status(500).json({ message: "Error fetching meetings", error: err.message });
  }
};

exports.rsvpMeeting = async (req, res) => {
  try {
    const { status } = req.body; // "confirmed" or "declined"

    if (!["confirmed", "declined"].includes(status)) {
      return res.status(400).json({ message: "Invalid RSVP status" });
    }

    const meetingId = req.params.id;

    // Check if meeting exists and belongs to user's community
    const meeting = await Meeting.findOne({
      _id: meetingId,
      community: req.user.community
    });
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    // Check if RSVP exists
    let attendee = await MeetingAttendee.findOne({
      meetingId,
      userId: req.user._id
    });

    if (attendee) {
      attendee.status = status; // update existing RSVP
      await attendee.save();
    } else {
      attendee = await MeetingAttendee.create({
        meetingId,
        userId: req.user._id,
        status
      });
    }

    res.json({ message: "RSVP updated successfully", attendee });
  } catch (err) {
    res.status(500).json({ message: "Error updating RSVP", error: err.message });
  }
};

exports.joinMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findOne({
      _id: req.params.id,
      community: req.user.community
    });

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    if (!meeting.onlineLink) {
      return res.status(400).json({ message: "This meeting does not have an online link" });
    }

    // If meeting is in future for safety
    if (meeting.meetingDate && meeting.meetingDate < new Date()) {
      return res.status(400).json({ message: "This meeting has already passed" });
    }

    res.json({
      message: "Open this link to join meeting",
      link: meeting.onlineLink
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching meeting link", error: err.message });
  }
};