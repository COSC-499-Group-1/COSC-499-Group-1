import { Component, Input, OnInit } from "@angular/core";
import { APIConfig, Constants } from "../../../shared/app-config";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { AuthenticationService } from "../../../shared/authentication.service";
import {
    NotificationObject,
    NotificationService,
    NotificationSocketObject
} from "../../../shared/notification.service";
import { ChannelObject } from "../sidebar.component";
import { Observable } from "rxjs";

interface UserObject {
    username: string;
    email: string;
}

interface ChannelAndFirstUser {
    channelName: string;
    channelType: string;
    firstUsername: string;
    firstUserChannelRole: string;
}

interface UserChannelObject {
    username: string;
    channelId: string;
    channelName: string;
    channelType: string;
    userChannelRole: string;
}
interface NewChannelResponse {
    channelId: string;
    channelName: string;
}
interface HttpResponse {
    status: number;
    data: {
        message: string;
        newChannel: ChannelObject;
    };
}

const NOTIFICATIONS_URI = "/fromFriend/";

@Component({
    selector: "app-friends-browser",
    templateUrl: "./friends-browser.component.html",
    styleUrls: ["./friends-browser.component.scss"]
})
export class FriendsBrowserComponent implements OnInit {
    friends: Array<UserObject> = [];
    inviteSearchList: Array<UserObject> = [];
    friendNotifications: Array<NotificationObject>;
    friendNotifcationUsernames: Array<string>;
    search: string = Constants.EMPTY;
    searching: boolean = false;
    private notificationsURL: string = APIConfig.notificationsAPI;
    private channelsURL: string = APIConfig.channelsAPI;
    @Input() userList: Array<UserObject>;
    @Input() friendList: Array<ChannelObject> = [];
    private NOTIFICATION_MESSAGE: string = " is requesting to direct message you!";

    constructor(
        private auth: AuthenticationService,
        private http: HttpClient,
        private notificationService: NotificationService
    ) {}

    ngOnInit() {
        this.getFriendNotifications();
    }

    onKey($event: Event) {
        //set search value as whatever is entered on search bar every keystroke
        this.search = ($event.target as HTMLInputElement).value;
        this.searching = true;
        this.sendQuery();
    }
    sendQuery() {
        if (this.search == Constants.EMPTY) {
            this.inviteSearchList = [];
        } else {
            for (let i in this.userList) {
                if (this.searchStrings(this.userList[i].username.toLowerCase(), this.search.toLowerCase())) {
                    if (this.inviteSearchList.indexOf(this.userList[i]) === -1) {
                        this.inviteSearchList.push(this.userList[i]);
                    }
                } else {
                    if (this.inviteSearchList[this.inviteSearchList.indexOf(this.userList[i])]) {
                        this.inviteSearchList.splice(this.inviteSearchList.indexOf(this.userList[i]), 1);
                    }
                }
            }
        }
    }

    findFriendChannel(username: string): boolean {
        for (let i in this.friendList) {
            let users = this.friendList[i].channelName.split("-", 2);
            if (users.includes(username)) return true;
        }
        return false;
    }

    sendInvite(username: string): void {
        let newChannel: ChannelAndFirstUser = {
            channelName: this.auth.getAuthenticatedUser().getUsername() + "-" + username,
            channelType: "friend",
            firstUsername: this.auth.getAuthenticatedUser().getUsername(),
            firstUserChannelRole: "friend"
        };

        this.auth.getCurrentSessionId().subscribe(
            (data) => {
                let httpHeaders = {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + data.getJwtToken()
                    })
                };

                this.http.post(this.channelsURL, newChannel, httpHeaders).subscribe(
                    (data: HttpResponse) => {
                        let notification: NotificationSocketObject = {
                            fromUser: {
                                username: this.auth.getAuthenticatedUser().getUsername(),
                                id: this.notificationService.getSocketId()
                            },
                            toUser: this.notificationService.getOnlineUserByUsername(username),
                            notification: {
                                channelId: data.data.newChannel.channelId,
                                channelName: data.data.newChannel.channelName,
                                fromFriend: this.auth.getAuthenticatedUser().getUsername(),
                                message: this.auth.getAuthenticatedUser().getUsername() + this.NOTIFICATION_MESSAGE,
                                type: "friend",
                                username: username,
                                notificationId: null,
                                insertedTime: null
                            }
                        };

                        this.notificationService.sendNotification(notification);
                        this.friendNotifcationUsernames.push(username);
                    },
                    (err) => {
                        console.log(err);
                    }
                ); // TODO: check for errors in responce
            },
            (err) => {
                console.log(err);
            }
        );
    }

    private getFriendNotifications(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.auth.getCurrentSessionId().subscribe(
                (data) => {
                    let httpHeaders = {
                        headers: new HttpHeaders({
                            "Content-Type": "application/json",
                            Authorization: "Bearer " + data.getJwtToken()
                        })
                    };

                    this.http
                        .get(
                            this.notificationsURL + NOTIFICATIONS_URI + this.auth.getAuthenticatedUser().getUsername(),
                            httpHeaders
                        )
                        .subscribe(
                            (data: Array<NotificationObject>) => {
                                this.friendNotifications = data;
                                let usernames: Array<string> = [];
                                for (let i in data) {
                                    usernames.push(data[i].username);
                                }
                                this.friendNotifcationUsernames = usernames;
                                resolve();
                            },
                            (err) => {
                                reject(err);
                            }
                        );
                },
                (err) => {
                    reject(err);
                }
            );
        });
    }

    private searchStrings(match: string, search: string): boolean {
        if (search === match) {
            return true;
        }
        if (search.length > match.length) {
            return false;
        }
        if (match.substring(0, search.length) == search) {
            return true;
        }
        return false;
    }
}