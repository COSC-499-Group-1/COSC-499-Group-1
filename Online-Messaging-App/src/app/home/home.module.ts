import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {ChatboxComponent} from "./chatbox/chatbox.component";
import {FooterComponent} from "./footer/footer.component";
import {HeaderComponent} from "./header/header.component";
import {ChannelBrowserComponent} from "./channel-browser/channel-browser.component";
import {HomeComponent} from "./home.component";
import {LogoutFormComponent} from "./logout/logout-form.component";
import {SidebarComponent} from "./sidebar/sidebar.component";
import {MaterialModule} from "../material/material.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MessengerService} from "../shared/messenger.service";
import {SocketIoConfig, SocketIoModule} from "ngx-socket-io";
import {AuthenticationService} from "../shared/authentication.service";
import {CommonService} from "../shared/common.service";
import {ProfileComponent} from "./profile/profile.component";

const socketConfig: SocketIoConfig = {url: "http://localhost:8080", options: {}};

@NgModule({
    declarations: [
        ChatboxComponent,
        ChannelBrowserComponent,
        FooterComponent,
        HeaderComponent,
        HomeComponent,
        LogoutFormComponent,
        ProfileComponent,
        SidebarComponent
    ],
    imports: [
        CommonModule,
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
        SocketIoModule.forRoot(socketConfig),
    ],
    exports: [
        HeaderComponent,
        HomeComponent,
        LogoutFormComponent,
        SidebarComponent,
        ChannelBrowserComponent,
        FooterComponent,
        ChatboxComponent,
        ProfileComponent
    ],
    providers: [MessengerService, AuthenticationService, CommonService]
})
export class HomeModule {
}
