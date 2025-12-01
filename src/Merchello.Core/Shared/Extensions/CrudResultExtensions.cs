using Merchello.Core.Shared.Models;
using Merchello.Core.Shared.Models.Enums;
using Microsoft.Extensions.Logging;

namespace Merchello.Core.Shared.Extensions;

public static class CrudResultExtensions
{
    /// <summary>
    /// Gets only the error messages
    /// </summary>
    /// <param name="messages"></param>
    /// <returns></returns>
    public static IEnumerable<ResultMessage> ErrorMessages(this List<ResultMessage> messages)
    {
        return messages.Where(x => x.ResultMessageType == ResultMessageType.Error);
    }

    /// <summary>
    /// Gets only the warning messages
    /// </summary>
    /// <param name="messages"></param>
    /// <returns></returns>
    public static IEnumerable<ResultMessage> WarningMessages(this List<ResultMessage> messages)
    {
        return messages.Where(x => x.ResultMessageType == ResultMessageType.Warning);
    }

    /// <summary>
    /// Logs the error and warning messages
    /// </summary>
    /// <param name="crudResult"></param>
    /// <param name="logger"></param>
    /// <typeparam name="T"></typeparam>
    /// <typeparam name="TR"></typeparam>
    public static void LogBadMessages<T, TR>(this CrudResult<T> crudResult, ILogger<TR> logger)
    {
        crudResult.LogErrorMessages(logger);
        crudResult.LogWarningMessages(logger);
    }

    /// <summary>
    /// Logs just the error messages
    /// </summary>
    /// <param name="crudResult"></param>
    /// <param name="logger"></param>
    /// <typeparam name="T"></typeparam>
    /// <typeparam name="TR"></typeparam>
    public static void LogErrorMessages<T, TR>(this CrudResult<T> crudResult, ILogger<TR> logger)
    {
        foreach (var errorMessage in crudResult.Messages.ErrorMessages())
        {
            logger.LogError("{Message}", errorMessage.Message);
        }
    }

    /// <summary>
    /// Logs just the warning messages
    /// </summary>
    /// <param name="crudResult"></param>
    /// <param name="logger"></param>
    /// <typeparam name="T"></typeparam>
    /// <typeparam name="TR"></typeparam>
    public static void LogWarningMessages<T, TR>(this CrudResult<T> crudResult, ILogger<TR> logger)
    {
        foreach (var warningMessage in crudResult.Messages.WarningMessages())
        {
            logger.LogWarning("{Message}", warningMessage.Message);
        }
    }

    /// <summary>
    /// Adds an error message to the CrudResult
    /// </summary>
    public static void AddErrorMessage<T>(this CrudResult<T> crudResult, string message)
    {
        crudResult.Messages.Add(new ResultMessage
        {
            Message = message,
            ResultMessageType = ResultMessageType.Error
        });
    }

    /// <summary>
    /// Adds a warning message to the CrudResult
    /// </summary>
    public static void AddWarningMessage<T>(this CrudResult<T> crudResult, string message)
    {
        crudResult.Messages.Add(new ResultMessage
        {
            Message = message,
            ResultMessageType = ResultMessageType.Warning
        });
    }

    /// <summary>
    /// Adds a success message to the CrudResult
    /// </summary>
    public static void AddSuccessMessage<T>(this CrudResult<T> crudResult, string message)
    {
        crudResult.Messages.Add(new ResultMessage
        {
            Message = message,
            ResultMessageType = ResultMessageType.Success
        });
    }
}
