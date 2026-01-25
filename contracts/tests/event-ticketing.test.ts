import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const user1 = accounts.get("wallet_1")!;
const user2 = accounts.get("wallet_2")!;

const eventContract = "event-ticketings";
const ticketContract = "ticketss";
const tokenContract = "mock-usdcx";

describe("Event Ticketing - Core Logic", () => {

  it("should create a basic event successfully", () => {
    // Create event
    const response = simnet.callPublicFn(
      eventContract,
      "create-event",
      [
        Cl.stringUtf8("Test Concert"),
        Cl.stringUtf8("Test Venue"),
        Cl.stringUtf8("New York, NY"),
        Cl.uint(2040000),
        Cl.uint(100),
        Cl.uint(10_000_000),
        Cl.stringAscii("https://example.com/events/1")
      ],
      deployer
    );

    // Public functions return ResponseOk
    expect(response.result).toBeOk(Cl.uint(1));

    // Read-only just returns a tuple directly
    const getEventResponse = simnet.callReadOnlyFn(
      eventContract,
      "get-event",
      [Cl.uint(1)],
      deployer
    );

    expect(getEventResponse.result).toStrictEqual(
      Cl.some(
        Cl.tuple({
          name: Cl.stringUtf8("Test Concert"),
          venue: Cl.stringUtf8("Test Venue"),
          city: Cl.stringUtf8("New York, NY"),
          date: Cl.uint(2040000),
          "max-tickets": Cl.uint(100),
          "price-usdcx": Cl.uint(10_000_000),
          organizer: Cl.principal(deployer),
          "tickets-sold": Cl.uint(0),
          "is-cancelled": Cl.bool(false),
          "token-uri": Cl.stringAscii("https://example.com/events/1")
        })
      )
    );
  });

  it("should allow a user to purchase tickets", () => {
    // Allow the event contract to mint tickets
    const setMinterResp = simnet.callPublicFn(
      ticketContract,
      "set-minter",
      [Cl.contractPrincipal(deployer, eventContract)],
      deployer
    );
    expect(setMinterResp.result).toBeOk(Cl.bool(true));

    // Create event
    simnet.callPublicFn(
      eventContract,
      "create-event",
      [
        Cl.stringUtf8("Music Fest"),
        Cl.stringUtf8("Open Air"),
        Cl.stringUtf8("Austin, TX"),
        Cl.uint(2050000),
        Cl.uint(50),
        Cl.uint(2_000_000),
        Cl.stringAscii("https://example.com/events/2")
      ],
      deployer
    );

    // Fund user1 with mock USDCx
    const mintResp = simnet.callPublicFn(
      tokenContract,
      "mint",
      [Cl.uint(10_000_000), Cl.principal(user1)],
      deployer
    );
    expect(mintResp.result).toBeOk(Cl.bool(true));

    // User1 buys 2 tickets
    const buyResponse = simnet.callPublicFn(
      eventContract,
      "purchase-ticket",
      [Cl.uint(1), Cl.uint(2), Cl.contractPrincipal(deployer, tokenContract)],
      user1
    );

    expect(buyResponse.result).toBeOk(
      Cl.tuple({
        "event-id": Cl.uint(1),
        "first-serial": Cl.uint(1),
        quantity: Cl.uint(2),
      })
    );

    // Check tickets-sold updated
    const getEventResponse = simnet.callReadOnlyFn(
      eventContract,
      "get-event",
      [Cl.uint(1)],
      user1
    );

    expect(getEventResponse.result).toStrictEqual(
      Cl.some(
        Cl.tuple({
          name: Cl.stringUtf8("Music Fest"),
          venue: Cl.stringUtf8("Open Air"),
          city: Cl.stringUtf8("Austin, TX"),
          date: Cl.uint(2050000),
          "max-tickets": Cl.uint(50),
          "price-usdcx": Cl.uint(2_000_000),
          organizer: Cl.principal(deployer),
          "tickets-sold": Cl.uint(2),
          "is-cancelled": Cl.bool(false),
          "token-uri": Cl.stringAscii("https://example.com/events/2")
        })
      )
    );

    // Check User1 ticket balance (read-only → raw uint)
    const getTicketsResponse = simnet.callReadOnlyFn(
      eventContract,
      "get-user-tickets",
      [Cl.uint(1), Cl.principal(user1)],
      user1
    );

    expect(getTicketsResponse.result).toStrictEqual(Cl.uint(2));

    // Check balances moved (2 tickets * 2 USDCx = 4 USDCx)
    const balUser = simnet.callReadOnlyFn(
      tokenContract,
      "get-balance",
      [Cl.principal(user1)],
      user1
    );
    expect(balUser.result).toBeOk(Cl.uint(6_000_000));

    const balOrg = simnet.callReadOnlyFn(
      tokenContract,
      "get-balance",
      [Cl.principal(deployer)],
      deployer
    );
    expect(balOrg.result).toBeOk(Cl.uint(4_000_000));

    // Ticket NFTs minted
    const lastId = simnet.callReadOnlyFn(ticketContract, "get-last-token-id", [], user1);
    expect(lastId.result).toBeOk(Cl.uint(2));

    const t1 = simnet.callReadOnlyFn(ticketContract, "get-ticket-info", [Cl.uint(1)], user1);
    expect(t1.result).toStrictEqual(
      Cl.some(Cl.tuple({ "event-id": Cl.uint(1), serial: Cl.uint(1) }))
    );

    const owner1 = simnet.callReadOnlyFn(ticketContract, "get-owner", [Cl.uint(1)], user1);
    expect(owner1.result).toBeOk(Cl.some(Cl.principal(user1)));

    const uri1 = simnet.callReadOnlyFn(ticketContract, "get-token-uri", [Cl.uint(1)], user1);
    expect(uri1.result).toBeOk(Cl.some(Cl.stringAscii("https://example.com/events/2")));
  });

  it("should allow organizer to cancel an event", () => {
    // Create event
    simnet.callPublicFn(
      eventContract,
      "create-event",
      [
        Cl.stringUtf8("Hackathon"),
        Cl.stringUtf8("Auditorium"),
        Cl.stringUtf8("Chicago, IL"),
        Cl.uint(2060000),
        Cl.uint(30),
        Cl.uint(5_000_000),
        Cl.stringAscii("https://example.com/events/3")
      ],
      deployer
    );

    // Cancel event
    const cancelResponse = simnet.callPublicFn(
      eventContract,
      "cancel-event",
      [Cl.uint(1)],
      deployer
    );

    expect(cancelResponse.result).toBeOk(Cl.bool(true));

    // Verify cancelled flag (read-only → tuple)
    const getEventResponse = simnet.callReadOnlyFn(
      eventContract,
      "get-event",
      [Cl.uint(1)],
      deployer
    );

    expect(getEventResponse.result).toStrictEqual(
      Cl.some(
        Cl.tuple({
          name: Cl.stringUtf8("Hackathon"),
          venue: Cl.stringUtf8("Auditorium"),
          city: Cl.stringUtf8("Chicago, IL"),
          date: Cl.uint(2060000),
          "max-tickets": Cl.uint(30),
          "price-usdcx": Cl.uint(5_000_000),
          organizer: Cl.principal(deployer),
          "tickets-sold": Cl.uint(0),
          "is-cancelled": Cl.bool(true),
          "token-uri": Cl.stringAscii("https://example.com/events/3")
        })
      )
    );
  });

});
