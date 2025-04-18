import pandas as pd
import datetime as dt
import toml
import google.generativeai as genai
from typing import List, Dict, Optional, Any
import time
import json
import sys
import folium
from folium.plugins import MarkerCluster
import tkinter as tk
from tkinter import ttk, messagebox
from tkcalendar import Calendar
import webbrowser
import os
import threading

# --- Configuration ---
CONFIG_FILE = "config.toml"
REFRESH_INTERVAL = 300  # 5 minutes in seconds
MAX_RETRIES = 3
MAP_FILE = "cultural_events_map.html"
CACHE_FILE = "events_cache.json"

# Global instance of the calendar
_calendar_instance = None

class CulturalEventsCalendar:
    def __init__(self):
        self.config = self._load_config()
        self.model = self._configure_gemini()
        self.events_df = self._initialize_data()
        self.root = tk.Tk()
        self.setup_gui()
        self.auto_refresh_thread = None

    def _load_config(self) -> Dict[str, Any]:
        """Load configuration from TOML file"""
        try:
            return toml.load(CONFIG_FILE)
        except Exception as e:
            print(f"Error loading config: {e}")
            sys.exit(1)

    def _configure_gemini(self) -> genai.GenerativeModel:
        """Configure Gemini AI model"""
        try:
            genai.configure(api_key=self.config["gemini"]["api_key"])
            return genai.GenerativeModel("gemini-1.5-pro")
        except Exception as e:
            print(f"Error configuring Gemini: {e}")
            sys.exit(1)

    def _initialize_data(self) -> pd.DataFrame:
        """Initialize events data with cache fallback"""
        print("⏳ Loading initial events data...")
        if os.path.exists(CACHE_FILE):
            try:
                with open(CACHE_FILE, 'r') as f:
                    cached_data = json.load(f)
                print("Loaded data from cache")
                return pd.DataFrame(cached_data)
            except Exception as e:
                print(f"Error loading cache: {e}")
        return self._fetch_events_data()

    def _fetch_events_data(self, retries: int = MAX_RETRIES) -> pd.DataFrame:
        """Fetch events data from Gemini with retry logic"""
        for attempt in range(retries):
            try:
                events_data = self._generate_events_data()
                if events_data:
                    # Save to cache
                    with open(CACHE_FILE, 'w') as f:
                        json.dump(events_data, f)
                    return pd.DataFrame(events_data)
                time.sleep(2)  # Wait before retry
            except Exception as e:
                print(f"Attempt {attempt + 1} failed: {e}")
        print("❌ Failed to fetch events data after multiple attempts")
        return pd.DataFrame()

    def _generate_events_data(self) -> Optional[List[Dict]]:
        """Generate events data using Gemini"""
        prompt = self._build_prompt()
        response = self._ask_gemini(prompt)
        return self._parse_response(response)

    def _build_prompt(self) -> str:
        """Build the prompt for Gemini"""
        return """Generate a Python list of 5 Indian cultural events with:
        - Event Name, Location(s), Latitude, Longitude
        - Dates (Gregorian and cultural), Time
        - Description, Rituals, Calendar URL
        - Time breakdown, Place details, Media links
        - Summary, Related events, Traditional aspects
        - Modern adaptations, Unique aspects
        Return only valid Python list of dictionaries.
        Example structure:
        [{
            "Event Name": "Diwali",
            "Location": ["Delhi", "Mumbai"],
            "Latitude": 28.6139,
            "Longitude": 77.2090,
            "Event Date": "2023-11-12",
            "Description": "Festival of lights...",
            "Media Links": ["https://example.com/image.jpg"]
        }]"""

    def _ask_gemini(self, prompt: str) -> str:
        """Query Gemini API with error handling"""
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"Gemini API error: {e}")
            return ""

    def _parse_response(self, response: str) -> Optional[List[Dict]]:
        """Parse Gemini response into Python objects"""
        try:
            if response.startswith("```python"):
                response = response[9:-3].strip()
            elif response.startswith("```json"):
                response = response[7:-3].strip()
            return json.loads(response.replace("'", '"'))
        except Exception as e:
            print(f"Error parsing response: {e}")
            return None

    def create_map(self) -> None:
        """Create interactive map with event locations"""
        if self.events_df.empty:
            messagebox.showwarning("No Data", "No events data available to create map")
            return

        # Create base map centered on India
        india_coords = [20.5937, 78.9629]
        m = folium.Map(location=india_coords, zoom_start=5)

        # Add marker cluster
        marker_cluster = MarkerCluster().add_to(m)

        # Add markers for each event
        for _, row in self.events_df.iterrows():
            if pd.notna(row.get('Latitude')) and pd.notna(row.get('Longitude')):
                popup_content = f"""
                <b>{row.get('Event Name', 'Event')}</b><br>
                <i>{row.get('Event Date', '')}</i><br>
                {row.get('Short Summary', '')}<br>
                <a href="{row.get('Calendar', '#')}" target="_blank">More Info</a>
                """
                folium.Marker(
                    location=[row['Latitude'], row['Longitude']],
                    popup=folium.Popup(popup_content, max_width=300),
                    tooltip=row['Event Name'],
                    icon=folium.Icon(color='red', icon='info-sign')
                ).add_to(marker_cluster)

        # Save map to HTML file
        m.save(MAP_FILE)
        webbrowser.open(f'file://{os.path.abspath(MAP_FILE)}')

    def setup_gui(self) -> None:
        """Set up the Tkinter GUI"""
        self.root.title("Indian Cultural Events Calendar")
        self.root.geometry("1000x700")
        self.root.protocol("WM_DELETE_WINDOW", self.on_close)

        # Create main container
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.pack(fill=tk.BOTH, expand=True)

        # Create notebook for tabs
        notebook = ttk.Notebook(main_frame)
        notebook.pack(fill=tk.BOTH, expand=True)

        # Events Tab
        events_tab = ttk.Frame(notebook)
        notebook.add(events_tab, text="Events")

        # Calendar Widget
        cal_frame = ttk.Frame(events_tab)
        cal_frame.pack(pady=10, fill=tk.X)

        self.cal = Calendar(cal_frame, selectmode='day', year=dt.datetime.now().year, 
                          month=dt.datetime.now().month, day=dt.datetime.now().day)
        self.cal.pack(pady=5)
        self.cal.bind("<<CalendarSelected>>", self.on_date_select)

        # Events Listbox
        list_frame = ttk.Frame(events_tab)
        list_frame.pack(fill=tk.BOTH, expand=True, pady=10)

        self.events_list = tk.Listbox(list_frame, height=15, font=('Arial', 11))
        self.events_list.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        self.events_list.bind('<<ListboxSelect>>', self.on_event_select)

        scrollbar = ttk.Scrollbar(list_frame, orient=tk.VERTICAL)
        scrollbar.config(command=self.events_list.yview)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        self.events_list.config(yscrollcommand=scrollbar.set)

        # Details Frame
        details_frame = ttk.LabelFrame(events_tab, text="Event Details", padding=10)
        details_frame.pack(fill=tk.BOTH, expand=True, pady=10)

        self.details_text = tk.Text(details_frame, wrap=tk.WORD, height=10, 
                                  font=('Arial', 10), padx=5, pady=5)
        self.details_text.pack(fill=tk.BOTH, expand=True)

        # Buttons Frame
        buttons_frame = ttk.Frame(events_tab)
        buttons_frame.pack(fill=tk.X, pady=10)

        ttk.Button(buttons_frame, text="Refresh Data", command=self.refresh_data).pack(side=tk.LEFT, padx=5)
        ttk.Button(buttons_frame, text="Show Map", command=self.create_map).pack(side=tk.LEFT, padx=5)
        ttk.Button(buttons_frame, text="Exit", command=self.on_close).pack(side=tk.RIGHT, padx=5)

        # Map Tab (placeholder)
        map_tab = ttk.Frame(notebook)
        notebook.add(map_tab, text="Map View")

        # Initialize UI with current data
        self.update_events_list()

    def update_events_list(self) -> None:
        """Update the events listbox with current data"""
        self.events_list.delete(0, tk.END)
        if not self.events_df.empty:
            for _, row in self.events_df.iterrows():
                self.events_list.insert(tk.END, 
                                      f"{row['Event Name']} - {row['Event Date']} - {row['Location']}")

    def on_date_select(self, event) -> None:
        """Handle date selection from calendar"""
        selected_date = self.cal.get_date()
        try:
            date_obj = dt.datetime.strptime(selected_date, "%m/%d/%y").date()
            formatted_date = date_obj.strftime("%Y-%m-%d")
            results = self.events_df[self.events_df["Event Date"] == formatted_date]
            
            self.events_list.delete(0, tk.END)
            if not results.empty:
                for _, row in results.iterrows():
                    self.events_list.insert(tk.END, 
                                          f"{row['Event Name']} - {row['Location']}")
            else:
                self.events_list.insert(tk.END, "No events on selected date")
                self.details_text.delete(1.0, tk.END)
        except ValueError:
            messagebox.showerror("Error", "Invalid date format")

    def on_event_select(self, event) -> None:
        """Handle event selection from listbox"""
        selection = self.events_list.curselection()
        if selection:
            index = selection[0]
            event_name = self.events_list.get(index).split(" - ")[0]
            event_data = self.events_df[self.events_df["Event Name"] == event_name].iloc[0]
            
            self.details_text.delete(1.0, tk.END)
            self.details_text.insert(tk.END, f"Event: {event_data['Event Name']}\n\n")
            self.details_text.insert(tk.END, f"Date: {event_data['Event Date']}\n")
            self.details_text.insert(tk.END, f"Location: {event_data['Location']}\n\n")
            self.details_text.insert(tk.END, f"Description:\n{event_data['Description']}\n\n")
            
            if pd.notna(event_data.get('Specific Time')):
                self.details_text.insert(tk.END, "Schedule:\n")
                for time, activity in event_data['Specific Time'].items():
                    self.details_text.insert(tk.END, f"- {time}: {activity}\n")

    def refresh_data(self) -> None:
        """Refresh events data and update UI"""
        self.events_df = self._fetch_events_data()
        self.update_events_list()
        messagebox.showinfo("Info", "Events data refreshed successfully")

    def auto_refresh(self) -> None:
        """Auto-refresh data in background"""
        while True:
            time.sleep(REFRESH_INTERVAL)
            self.events_df = self._fetch_events_data()
            self.root.after(0, self.update_events_list)

    def on_close(self) -> None:
        """Handle window close event"""
        if self.auto_refresh_thread and self.auto_refresh_thread.is_alive():
            self.auto_refresh_thread.join(timeout=1)
        self.root.destroy()

    def run(self) -> None:
        """Run the application"""
        # Start auto-refresh thread
        self.auto_refresh_thread = threading.Thread(target=self.auto_refresh, daemon=True)
        self.auto_refresh_thread.start()
        
        self.root.mainloop()

def setup_calendar_model():
    """Initialize and return the calendar instance"""
    global _calendar_instance
    if _calendar_instance is None:
        _calendar_instance = CulturalEventsCalendar()
    return _calendar_instance

def get_upcoming_events():
    """Get a list of upcoming events"""
    calendar = setup_calendar_model()
    if calendar.events_df.empty:
        return []
    
    events = []
    for _, row in calendar.events_df.iterrows():
        event = {
            "name": row.get("Event Name", ""),
            "date": row.get("Event Date", ""),
            "location": row.get("Location", []),
            "description": row.get("Description", ""),
            "calendar_url": row.get("Calendar", "")
        }
        events.append(event)
    return events

def get_event_info(model, event_name, location):
    """Get detailed information about a specific event"""
    calendar = setup_calendar_model()
    if calendar.events_df.empty:
        return {"error": "No events data available"}
    
    event = calendar.events_df[calendar.events_df["Event Name"] == event_name]
    if event.empty:
        return {"error": f"Event '{event_name}' not found"}
    
    event_data = event.iloc[0]
    return {
        "name": event_data.get("Event Name", ""),
        "date": event_data.get("Event Date", ""),
        "location": event_data.get("Location", []),
        "description": event_data.get("Description", ""),
        "rituals": event_data.get("Rituals", ""),
        "time_breakdown": event_data.get("Time Breakdown", ""),
        "place_details": event_data.get("Place Details", ""),
        "media_links": event_data.get("Media Links", []),
        "traditional_aspects": event_data.get("Traditional Aspects", ""),
        "modern_adaptations": event_data.get("Modern Adaptations", ""),
        "unique_aspects": event_data.get("Unique Aspects", "")
    }

def main():
    try:
        calendar = CulturalEventsCalendar()
        calendar.run()
    except Exception as e:
        messagebox.showerror("Error", f"Application error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()