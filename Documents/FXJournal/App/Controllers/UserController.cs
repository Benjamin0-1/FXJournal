using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using FXJournal.Application.Core.Authentication.CommandHandlers;
using FXJournal.Application.Core.Authentication.Commands;

// still need to implement command and commandHandlers.

[Route("api/[controller]")] // q: which url will this controller be available at? a: /api/user
[ApiController]
public class UserController : ControllerBase
{
    private readonly IMediator _mediator;

    public UserController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("login")]
    public async Task<IActionResult> LoginUserAsync([FromBody] LoginUserCommand command)
    {
        var token = await _mediator.Send(command);
        return Ok(token);
    }

    /*

    [HttpPost("register")]
    //[Authorize(Roles = "Admin")]
    
    public async Task<IActionResult> RegisterUserAsync([FromBody] RegisterUserCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }
    */

/*
    [HttpPost("assignrole")]
    [Authorize(Roles="Admin")]
    public async Task<IActionResult> AssignRoleAsync([FromBody] AssignRoleCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    } 
*/
}