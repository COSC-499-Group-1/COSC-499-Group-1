import { Component, OnInit } from "@angular/core";
import { AuthenticationService } from "../shared/authentication.service";
import { CommonService } from "../shared/common.service";
import { FormBuilder, FormGroup } from "@angular/forms";
import { NotificationService } from "../shared/notification.service";
import { CookieService } from "ngx-cookie-service";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { APIConfig } from "../shared/app-config";
import { ColorScheme, DarkThemeColors, LightThemeColors } from "../app.component";

const PROFILE_PAGE = "profile";
const CHANNEL_BROWSER = "channelBrowser";
const CHAT_BOX = "chatBox;";
const DARK = "dark";
const LIGHT = "light";

const SETTINGS_URI = "/settings";

export interface UserChannelObject {
    username: string;
    channelId: string;
    userChannelRole: string;
    channelName: string;
    channelType: string;
}

export interface SettingsObject {
    username: string;
    theme: string;
}

interface ChannelObject {
    channelId: string;
    channelName: string;
    channelType: string;
}

interface UserObject {
    username: string;
    email: string;
}

@Component({
    selector: "app-home",
    templateUrl: "./home.component.html",
    styleUrls: ["./home.component.scss"]
})
export class HomeComponent implements OnInit {
    userLoggedIn = false;
    options: FormGroup;

    display: string = CHANNEL_BROWSER;
    selectedChannelId: string;
    selectedChannelName: string;
    newAddedChannel: ChannelObject;
    newSubbedChannel: ChannelObject;
    profileView: string;
    usersUrl: string = APIConfig.usersAPI;
    userList: Array<UserObject> = [];
    currentTheme: string;
    private scrollContainer: any;

    constructor(
        private auth: AuthenticationService,
        public common: CommonService,
        fb: FormBuilder,
        private cookieService: CookieService,
        private notificationService: NotificationService,
        private http: HttpClient
    ) {
        this.userLoggedIn = auth.isLoggedIn();
        if (this.userLoggedIn) {
            this.options = fb.group({
                bottom: 0,
                fixed: false,
                top: 0
            });
            this.notificationService = NotificationService.getInstance();
            this.notificationService.getSocket(this.auth.getAuthenticatedUser().getUsername());
        }
    }

    ngOnInit(): void {
        if (this.cookieService.get("lastChannelID")) {
            this.selectedChannelId = this.cookieService.get("lastChannelID");
            this.display = "chatBox";
        } else {
            this.display = CHANNEL_BROWSER;
        }
        if (this.auth.isLoggedIn()) {
            this.getUsers();
            this.getSettings();
        }
    }

    receiveId($event) {
        this.selectedChannelId = $event;
    }

    receiveName($event) {
        this.selectedChannelName = $event;
    }

    receiveNewSubbedChannel(event: ChannelObject) {
        this.newSubbedChannel = event;
    }

    addNewChannel($event) {
        this.newAddedChannel = $event;
    }

    updateDisplay(value: string): void {
        this.display = value;
    }

    updateProfile(value: string): void {
        this.profileView = value;
        this.updateDisplay(PROFILE_PAGE);
    }

    private getUsers(): void {
        this.auth.getCurrentSessionId().subscribe(
            (data) => {
                let httpHeaders = {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + data.getJwtToken()
                    })
                };

                this.http.get(this.usersUrl, httpHeaders).subscribe(
                    (data: Array<UserObject>) => {
                        this.userList = data;
                    },
                    (err) => {
                        console.log(err);
                    }
                );
            },
            (err) => {
                console.log(err);
            }
        );
    }

    private getSettings(): void {
        this.auth.getCurrentSessionId().subscribe(
            (data) => {
                let httpHeaders = {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + data.getJwtToken()
                    })
                };

                this.http
                    .get(this.usersUrl + this.auth.getAuthenticatedUser().getUsername() + SETTINGS_URI, httpHeaders)
                    .subscribe(
                        (data: SettingsObject) => {
                            this.changeTheme(data[0].theme);
                        },
                        (err) => {
                            console.log(err);
                        }
                    );
            },
            (err) => {
                console.log(err);
            }
        );
    }

    private changeTheme(themeString: string): void {
        this.currentTheme = themeString;
        if (themeString == LIGHT) {
            this.setTheme(LightThemeColors);
        } else if (themeString == DARK) {
            this.setTheme(DarkThemeColors);
        }
    }

    private setTheme(theme: ColorScheme): void {
        document.documentElement.style.setProperty("--primary-color", theme["primary-color"]);
        document.documentElement.style.setProperty("--secondary-color", theme["secondary-color"]);
        document.documentElement.style.setProperty("--tertiary-color", theme["tertiary-color"]);
        document.documentElement.style.setProperty("--primary-text-color", theme["primary-text-color"]);
        document.documentElement.style.setProperty("--soft-black", theme["soft-black"]);
        document.documentElement.style.setProperty("--background-color", theme["background-color"]);
        document.documentElement.style.setProperty("--element-color", theme["element-color"]);
        document.documentElement.style.setProperty("--hover-color", theme["hover-color"]);
        document.documentElement.style.setProperty("--element-hover-color", theme["element-hover-color"]);
    }
}
